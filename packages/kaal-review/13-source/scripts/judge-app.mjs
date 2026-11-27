// review/C6: the judgements of the Apps that Review owns, over data and text. Nothing here reads Git or GitHub, runs a workflow, mints a token or
// creates or installs an App; the Owner does that, and Hosting's adapter turns a declaration into what GitHub grants.
const f = (kind, detail) => ({ kind, detail });
const verdict = (findings) => ({ verdict: findings.length ? 'out' : 'in', findings });
/** The abilities each App declares, exactly. An ability is a neutral word of Hosting's closed list. */
const AUTH = { inspector: ['post-checks', 'read-checks', 'read-contents', 'read-pull-requests'] };
/** Reads the declaration of an App as data and finds what it holds beyond or short of its authority. */
export function readDeclaration(text, app = 'inspector') {
  const INSPECTOR = AUTH[app] ?? [];
  let d; try { d = JSON.parse(text); } catch { return { declaration: null, findings: [f('unreadable', 'not JSON')] }; }
  const findings = [];
  if (d?.app !== app) findings.push(f('wrong-app', String(d?.app)));
  if (d?.owner !== 'review') findings.push(f('wrong-owner', String(d?.owner)));
  if (typeof d?.purpose !== 'string' || !d.purpose) findings.push(f('no-purpose', ''));
  if (!Array.isArray(d?.abilities)) findings.push(f('abilities-not-a-list', ''));
  else {
    for (const a of d.abilities) if (!INSPECTOR.includes(a)) findings.push(f('ability-beyond-authority', a));
    for (const a of INSPECTOR) if (!d.abilities.includes(a)) findings.push(f('ability-missing', a));
    if (new Set(d.abilities).size !== d.abilities.length) findings.push(f('ability-repeated', ''));
  }
  return { declaration: findings.length ? null : d, findings };
}
/** Judges a set of declarations for the rule that no App decides on what it raised. */
export function judgeApps(apps) {
  if (!Array.isArray(apps)) return verdict([f('unreadable', 'not a list')]);
  const out = [];
  for (const a of apps) {
    if (!Array.isArray(a?.abilities)) { out.push(f('no-abilities', String(a?.app))); continue; }
    const approves = a.abilities.includes('approve-pull-requests'), raises = a.abilities.includes('raise-pull-requests');
    if (approves && raises) out.push(f('raises-and-approves', a.app));
    if (approves && a.app !== 'approver') out.push(f('approves-beyond-approver', a.app));
  }
  return verdict(out);
}
const KEY = 'KAAL_APP_INSPECTOR_KEY';
const jobs = (t) => { const body = t.split(/^jobs:\n/m)[1] ?? ''; const o = {}; const p = body.split(/^  ([A-Za-z0-9_-]+):\n/m); for (let i = 1; i < p.length; i += 2) o[p[i]] = p[i + 1]; return o; };
/** Judges the text of the workflow of the Inspector for the separation of the judge and the sign job. */
export function judgeWorkflow(text) {
  if (typeof text !== 'string' || !text) return verdict([f('job-missing', 'no text')]);
  const out = []; const j = jobs(text);
  if (!j.judge || !j.sign) return verdict([f('job-missing', 'judge or sign')]);
  if (/pull_request_target/.test(text)) out.push(f('pull-request-target', ''));
  if (!/^permissions: \{\}$/m.test(text)) out.push(f('permissions-not-empty', ''));
  if (/secrets\./.test(j.judge) || j.judge.includes(KEY)) out.push(f('judge-names-secret', ''));
  if (!j.judge.includes('persist-credentials: false')) out.push(f('judge-keeps-credentials', ''));
  if (!/permissions:\n\s+contents: read\n/.test(j.judge) || /: write/.test(j.judge)) out.push(f('judge-holds-more', ''));
  if (!/needs: judge/.test(j.sign)) out.push(f('sign-without-needs', ''));
  if (!j.sign.includes(`secrets.${KEY}`)) out.push(f('sign-lacks-key', ''));
  if ((text.match(new RegExp(KEY, 'g')) ?? []).length !== (j.sign.match(new RegExp(KEY, 'g')) ?? []).length) out.push(f('key-outside-sign', ''));
  if (/refs\/pull|merge_group\.head_ref|ref: .*head/.test(j.sign)) out.push(f('sign-reads-change', ''));
  const base = /ref: \$\{\{ github\.event\.pull_request\.base\.sha \|\| github\.event\.merge_group\.base_sha \}\}/;
  if (!base.test(j.sign)) out.push(f('sign-reads-change', 'sign does not check out the base'));
  if (!base.test(j.judge)) out.push(f('judge-reads-change', 'judge does not check out the base'));
  for (const m of text.matchAll(/^\s*(?:- )?uses:\s*(\S+)/gm)) if (!/@[0-9a-f]{40}$/.test(m[1])) out.push(f('action-unpinned', m[1]));
  if (/\$\{\{\s*github\.(event\.pull_request\.(title|body|head\.ref|head\.label|user)|head_ref)/.test(text)) out.push(f('change-text-in-command', ''));
  if (!/--head "\$HEAD_SHA"/.test(j.judge) || !/rev-parse refs\/remotes\/pull\/head\)" = "\$HEAD_SHA"/.test(j.judge) || !/--run "\$GITHUB_RUN_ID"/.test(j.judge) || !/--revision "\$HEAD_SHA"/.test(j.sign) || !/--run "\$GITHUB_RUN_ID"/.test(j.sign)) out.push(f('verdict-unbound', ''));
  return verdict(out);
}

const HEX = /^[0-9a-f]{40}$/;
/** A change that touches the execution and signing surface is never a pass: its answer is unknown and the Owner decides. */
export function judgeSelfModification(paths, surface) {
  const u = (kind) => ({ verdict: 'unknown', findings: [f(kind, '')] });
  if (!Array.isArray(paths) || !Array.isArray(surface) || !surface.length) return u('unreadable');
  const hit = [];
  for (const p of paths) {
    if (typeof p !== 'string' || p.split('/').includes('..') || p.split('/').includes('.')) return u('touches-inspector');
    if (surface.some((s) => (s.endsWith('/') ? p.startsWith(s) : p === s))) hit.push(p);
  }
  return hit.length ? { verdict: 'unknown', findings: [f('touches-inspector', hit.join(','))] } : { verdict: 'in', findings: [] };
}
/** Evidence is bound to a revision, a base and a run, and must come from the judge job. */
export function checkEvidence(e, x) {
  if (!e || typeof e !== 'object' || !x || !HEX.test(x.revision ?? '')) return { verdict: 'unknown', findings: [f('malformed-evidence', '')] };
  const out = [];
  if (!e.revision) out.push(f('unbound', '')); else if (e.revision !== x.revision) out.push(f('stale-revision', ''));
  if (e.base !== x.base) out.push(f('stale-base', ''));
  if (e.run !== x.run || e.job !== 'judge') out.push(f('foreign-run', ''));
  if (!Array.isArray(e.verdicts) || e.verdicts.some((v) => !['pass', 'fail', 'unknown'].includes(v?.verdict))) out.push(f('malformed-evidence', ''));
  else if (e.verdicts.some((v) => v.verdict === 'unknown')) out.push(f('unknown-verdict', ''));
  return { verdict: out.length ? 'out' : 'in', findings: out };
}
