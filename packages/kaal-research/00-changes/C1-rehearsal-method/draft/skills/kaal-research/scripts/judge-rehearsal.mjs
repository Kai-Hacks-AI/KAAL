import { readFileSync } from 'node:fs';
import { parse } from './parse.mjs';
const ID = /^[a-z][a-z0-9-]*\/RH[1-9]\d*$/;
const VERDICTS = ['favourable', 'unfavourable', 'inconclusive'];
const ROLES = ['prompt', 'subject', 'key', 'rubric', 'answers', 'scores'];
const EXPOSURE = ['none', 'opened', 'delivered', 'unchecked'];
const DEMO = ['yes', 'partly', 'no'];
const inside = (p) => !!p && !p.startsWith('/') && !/^[A-Za-z]:/.test(p) && !/(^|\/)\.\.(\/|$)/.test(p);
const list = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
// Form only. Handed the record text and { path, sha256 } for the files the caller holds. It never says the research is true.
export function judgeRehearsal(text, files = []) {
  const doc = parse(text);
  if (!doc || doc.front.kind !== 'rehearsal') return { result: 'unjudged', problems: [] };
  const problems = [];
  const bad = (section, rule, entry) => problems.push(entry === undefined ? { section, rule } : { section, rule, entry });
  const { front, sections: S } = doc;
  if (!ID.test(front.id || '')) bad('front', 'id');
  if (!VERDICTS.includes(front.verdict)) bad('front', 'verdict');
  if (!front.question) bad('front', 'question');
  const D = S.Design?.fields ?? {};
  const arms = list(D.arms);
  if (arms.length < 2) bad('Design', 'arms');
  if (!arms.includes(D.untreated)) bad('Design', 'no-untreated-arm');
  const n = {};
  for (const x of list(D.n)) { const [a, v] = x.split('='); n[a] = Number(v); }
  for (const a of arms) if (!Number.isInteger(n[a]) || n[a] < 1) bad('Design', 'n', a);
  if (new Set(arms.map((a) => n[a])).size > 1 && !D['n-note']) bad('Design', 'n-unequal');
  for (const k of ['fresh-means', 'model', 'settings']) if (!D[k]) bad('Design', k);
  if (!['yes', 'no'].includes(D['isolation-checked'])) bad('Design', 'isolation-checked');
  if (!['yes', 'no'].includes(D.blind)) bad('Design', 'blind');
  else if (D.blind === 'yes' && !D['blind-how']) bad('Design', 'blind-how');
  const kf = Date.parse(D['key-frozen']); const tf = Date.parse(D['treatment-fixed']);
  if (Number.isNaN(kf) || Number.isNaN(tf)) bad('Design', 'key-times');
  else if (kf >= tf) bad('Design', 'key-after-treatment');
  const ev = S.Evidence?.entries ?? [];
  for (const role of ROLES) if (!ev.some((e) => e.role === role)) bad('Evidence', 'role-missing', role);
  for (const e of ev) {
    if (!inside(e.path)) { bad('Evidence', 'evidence-outside', e.path); continue; }
    const f = files.find((x) => x.path === e.path);
    if (!f) bad('Evidence', 'evidence-missing', e.path);
    else if (f.sha256 !== e.sha256) bad('Evidence', 'evidence-changed', e.path);
  }
  const runs = S.Runs?.entries ?? [];
  const ids = new Set();
  for (const r of runs) {
    if (!r.run || ids.has(r.run)) bad('Runs', 'run-id', r.run);
    ids.add(r.run);
    if (!arms.includes(r.arm)) bad('Runs', 'run-arm', r.run);
    if (!EXPOSURE.includes(r.exposure)) bad('Runs', 'exposure', r.run);
    else if (r.arm === D.untreated && r.exposure !== 'none') bad('Runs', 'untreated-arm-exposed', r.run);
    else if (r.arm !== D.untreated && r.exposure === 'none') bad('Runs', 'treated-arm-unexposed', r.run);
    if (r.exposure === 'opened' && !ev.some((e) => e.path === r.excerpt)) bad('Runs', 'exposure-excerpt', r.run);
  }
  for (const a of arms) if (runs.filter((r) => r.arm === a).length !== n[a]) bad('Runs', 'runs-differ-from-n', a);
  const claims = S.Claims?.entries ?? [];
  if (!claims.length) bad('Claims', 'none');
  claims.forEach((c, i) => {
    const at = c.claim || `#${i + 1}`;
    if (!c.claim) bad('Claims', 'statement', at);
    if (!DEMO.includes(c.demonstrated)) { bad('Claims', 'demonstrated', at); return; }
    if (c.demonstrated !== 'yes' && !c['not-shown']) bad('Claims', 'not-shown', at);
    const rest = list(c['rests-on']);
    if (!rest.length || rest.some((id) => !ids.has(id))) bad('Claims', 'rests-on', at);
    const weak = rest.some((id) => { const r = runs.find((x) => x.run === id); return r && r.arm !== D.untreated && r.exposure !== 'opened'; });
    if (c.demonstrated === 'yes' && weak) bad('Claims', 'unverified-exposure', at);
  });
  if (!S.Limits?.fields['n-shows']) bad('Limits', 'n-shows');
  if (front.verdict === 'favourable' && (D.blind !== 'yes' || claims.some((c) => c.demonstrated !== 'yes'))) bad('front', 'verdict-overstates');
  return { result: problems.length ? 'malformed' : 'well-formed', problems };
}
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const [rec, filesJson] = process.argv.slice(2);
  const r = judgeRehearsal(readFileSync(rec, 'utf8'), filesJson ? JSON.parse(readFileSync(filesJson, 'utf8')) : []);
  console.log(JSON.stringify(r));
  process.exit(r.result === 'well-formed' ? 0 : 2);
}
