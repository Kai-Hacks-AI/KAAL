import { readFileSync } from 'node:fs';
import { parse } from './parse.mjs';
const ID = /^[a-z][a-z0-9-]*\/RH[1-9]\d*$/;
const VERDICTS = ['favourable', 'unfavourable', 'inconclusive'];
const REQUIRED_ROLES = ['prompt', 'answers', 'scores'];
const EXPOSURE = ['none', 'opened', 'delivered', 'unchecked'];
const DEMO = ['yes', 'partly', 'no'];
const RANK = { description: 0, comparison: 1, effect: 2 };
const SAYS = 'form only: this says what the record states, nothing about whether the claims are true or the design sound';
const inside = (p) => !!p && !p.startsWith('/') && !/^[A-Za-z]:/.test(p) && !/(^|\/)\.\.(\/|$)/.test(p);
const list = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
// Form only. Handed the record text and { path, sha256 } for the files the caller holds.
export function judgeRehearsal(text, files = []) {
  const doc = parse(text);
  if (!doc || doc.front.kind !== 'rehearsal') return { result: 'unjudged', problems: [], says: SAYS };
  const problems = [];
  const bad = (section, rule, entry) => problems.push(entry === undefined ? { section, rule } : { section, rule, entry });
  const { front, sections: S } = doc;
  if (!ID.test(front.id || '')) bad('front', 'id');
  if (!VERDICTS.includes(front.verdict)) bad('front', 'verdict');
  if (!front.question) bad('front', 'question');
  if (!(front['verdict-about'] in RANK)) bad('front', 'verdict-about');
  const D = S.Design?.fields ?? {};
  const arms = list(D.arms);
  if (!arms.length) bad('Design', 'arms');
  const untreated = arms.includes(D.untreated) ? D.untreated : null;
  if (!untreated && D.untreated !== 'none') bad('Design', 'untreated');
  const n = {};
  for (const x of list(D.n)) { const [a, v] = x.split('='); n[a] = Number(v); }
  for (const a of arms) if (!Number.isInteger(n[a]) || n[a] < 1) bad('Design', 'n', a);
  for (const k of ['fresh-means', 'model', 'settings']) if (!D[k]) bad('Design', k);
  if (!['yes', 'no'].includes(D.blind)) bad('Design', 'blind');
  else if (D.blind === 'yes' && !D['blind-how']) bad('Design', 'blind-how');
  const kf = Date.parse(D['key-frozen']); const tf = Date.parse(D['treatment-fixed']);
  const keyOk = !Number.isNaN(kf) && !Number.isNaN(tf) && kf < tf;
  if (Boolean(D['key-frozen']) !== Boolean(D['treatment-fixed'])) bad('Design', 'key-times');
  else if (D['key-frozen'] && !keyOk) bad('Design', Number.isNaN(kf) || Number.isNaN(tf) ? 'key-times' : 'key-after-treatment');
  const ev = S.Evidence?.entries ?? [];
  for (const role of REQUIRED_ROLES) if (!ev.some((e) => e.role === role)) bad('Evidence', 'role-missing', role);
  for (const e of ev) {
    if (!inside(e.path)) { bad('Evidence', 'evidence-outside', e.path); continue; }
    const f = files.find((x) => x.path === e.path);
    if (!f) bad('Evidence', 'evidence-missing', e.path);
    else if (f.sha256 !== e.sha256) bad('Evidence', 'evidence-changed', e.path);
  }
  const runs = S.Runs?.entries ?? [];
  const byId = new Map();
  for (const r of runs) {
    if (!r.run || byId.has(r.run)) bad('Runs', 'run-id', r.run);
    byId.set(r.run, r);
    if (!arms.includes(r.arm)) bad('Runs', 'run-arm', r.run);
    if (!EXPOSURE.includes(r.exposure)) bad('Runs', 'exposure', r.run);
    else if (r.arm === untreated && r.exposure !== 'none') bad('Runs', 'untreated-arm-exposed', r.run);
    else if (r.arm !== untreated && r.exposure === 'none') bad('Runs', 'treated-arm-unexposed', r.run);
    if (r.exposure === 'opened' && !ev.some((e) => e.path === r.excerpt)) bad('Runs', 'exposure-excerpt', r.run);
  }
  for (const a of arms) if (runs.filter((r) => r.arm === a).length !== n[a]) bad('Runs', 'runs-differ-from-n', a);
  const claims = S.Claims?.entries ?? [];
  if (!claims.length) bad('Claims', 'none');
  const claimById = new Map();
  claims.forEach((c, i) => {
    const at = c.id || `#${i + 1}`;
    if (!c.id || claimById.has(c.id)) bad('Claims', 'id', at);
    claimById.set(c.id, c);
    if (!c.claim) bad('Claims', 'statement', at);
    if (!(c.scope in RANK)) bad('Claims', 'scope', at);
    if (!DEMO.includes(c.demonstrated)) { bad('Claims', 'demonstrated', at); return; }
    if (c.demonstrated !== 'yes' && !c['not-shown']) bad('Claims', 'not-shown', at);
    const rest = list(c['rests-on']);
    if (!rest.length || rest.some((id) => !byId.has(id))) { bad('Claims', 'rests-on', at); return; }
    if (c.demonstrated !== 'yes') return;
    const used = rest.map((id) => byId.get(id));
    if (c.scope === 'comparison' && new Set(used.map((r) => r.arm)).size < 2) bad('Claims', 'comparison-needs-two-arms', at);
    if (c.scope === 'effect') {
      if (!untreated || !used.some((r) => r.arm === untreated) || !used.some((r) => r.arm !== untreated)) bad('Claims', 'effect-needs-untreated', at);
      if (D.blind !== 'yes') bad('Claims', 'effect-needs-blind', at);
      if (!keyOk || !ev.some((e) => e.role === 'key')) bad('Claims', 'effect-needs-key', at);
      if (used.some((r) => r.arm !== untreated && r.exposure !== 'opened')) bad('Claims', 'effect-needs-exposure', at);
    }
  });
  if (!S.Limits?.fields['n-shows']) bad('Limits', 'n-shows');
  const base = list(front['verdict-rests-on']).map((id) => claimById.get(id));
  if (!base.length || base.some((c) => !c)) bad('front', 'verdict-rests-on');
  else {
    const top = Math.max(...base.map((c) => RANK[c.scope] ?? 0));
    if (front['verdict-about'] in RANK && RANK[front['verdict-about']] !== top) bad('front', 'verdict-about-mismatch');
    if (front.verdict === 'favourable' && base.some((c) => c.demonstrated !== 'yes')) bad('front', 'verdict-overstates');
  }
  return { result: problems.length ? 'malformed' : 'well-formed', problems, says: SAYS };
}
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const [rec, filesJson] = process.argv.slice(2);
  const r = judgeRehearsal(readFileSync(rec, 'utf8'), filesJson ? JSON.parse(readFileSync(filesJson, 'utf8')) : []);
  console.log(JSON.stringify(r));
  process.exit(r.result === 'well-formed' ? 0 : 2);
}
