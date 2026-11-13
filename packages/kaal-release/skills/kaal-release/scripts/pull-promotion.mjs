// pull Promotion: for each collector the declaration lists, in the declared order, says whether the collector has fulfilled its PDCA.
// The collector is the unit, judged from its file state: the effective delta against main, the tree at its head and its history.
// It qualifies when its delta holds PLAN and DO files, every expected Test Case has a green latest execution at the exact head, and
// exactly one 4L retrospective concludes the collected work. Order is the history's (ancestry), never a time. Missing, stale or
// ambiguous evidence is "not judged" and never qualifies. Advisory: it names the qualifiers and the first one that moves next, and
// authorizes or recommends nothing. Read-only, deterministic, no host access.
// Usage: node pull-promotion.mjs <facts.json> <declaration.json>
import { readFileSync } from 'node:fs';
const uniq = (a) => [...new Set(a)].sort();
const isList = (v) => Array.isArray(v) && v.length > 0;
const any = (patterns, path) => patterns.some((p) => new RegExp(p).test(path));
export function walkCollectors(facts, declaration) {
  const problems = [];
  const declared = (declaration.collectors ?? []).map((c) => c.name);
  if (!declared.length) problems.push('the declaration lists no collectors');
  const ev = declaration.evidence;
  const undecl = [];
  if (!ev) undecl.push('evidence declaration');
  else {
    if (!isList(ev.plan)) undecl.push('plan evidence');
    if (!isList(ev.do)) undecl.push('do evidence');
    if (typeof ev.cases?.files !== 'string') undecl.push('cases evidence');
    if (typeof ev.act?.files !== 'string' || !isList(ev.act?.headings)) undecl.push('act evidence (files and 4L headings)');
  }
  for (const u of undecl) problems.push(`the declaration lists no ${u}`);
  const host = facts.collectors ?? [];
  const entries = declared.map((name) => {
    const col = host.find((c) => c.name === name);
    if (!col) return { name, status: 'not judged', missing: ['the collector on the host'] };
    if (undecl.length) return { name, status: 'not judged', missing: undecl.map((u) => `the ${u}`) };
    const missing = []; let unknown = false; let fail = false;
    const no = (m) => { fail = true; missing.push(m); };
    const dunno = (m) => { unknown = true; missing.push(m); };
    if (!Array.isArray(col.delta) || !Array.isArray(col.tree) || !Array.isArray(col.history)) return { name, status: 'not judged', missing: ['the delta, the tree and the history of the collector'] };
    if (col.history.length && col.history.at(-1).id !== col.at) dunno('the history does not end at the head being qualified');
    const live = col.delta.filter((f) => f.status !== 'removed');
    if (!col.delta.length) no('files that differ from main: the delta is empty');
    const plan = live.filter((f) => any(ev.plan, f.path));
    const dos = live.filter((f) => any(ev.do, f.path));
    if (col.delta.length && !plan.length) no('PLAN: no file of the delta matches the plan evidence');
    if (col.delta.length && !dos.length) no('DO: no file of the delta matches the do evidence');
    const caseRe = new RegExp(ev.cases.files);
    const idsIn = (paths) => paths.map((p) => caseRe.exec(p)?.[1]).filter(Boolean);
    const expected = uniq([...idsIn(col.tree), ...(ev.cases.required ?? [])]);
    for (const id of ev.cases.required ?? []) if (!idsIn(col.tree).includes(id)) no(`Test Case ${id} is required and the tree has no such Case`);
    if (!expected.length) dunno('an expected Test Case in the tree');
    for (const id of expected) {
      if ((ev.cases.required ?? []).includes(id) && !idsIn(col.tree).includes(id)) continue;
      const runs = (col.executions ?? []).filter((e) => e.case === id && e.head === col.at).sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
      const last = runs.at(-1);
      if (!last) dunno(`Test Case ${id} has no execution at the current head`);
      else if (last.conclusion === 'failure') no(`Test Case ${id}: failure`);
      else if (last.conclusion !== 'success') dunno(`Test Case ${id}: ${last.conclusion}`);
    }
    const candidates = live.filter((f) => new RegExp(ev.act.files).test(f.path));
    const acts = [];
    let unread = false;
    for (const f of candidates) {
      const text = col.texts?.[f.path];
      if (typeof text !== 'string') { unread = true; dunno(`${f.path} was not read`); continue; }
      if (ev.act.headings.every((h) => new RegExp(`^#{1,6}\\s*${h}\\b`, 'm').test(text))) acts.push(f);
    }
    if (col.delta.length && !acts.length && !unread) no('ACT: no file of the delta holds one 4L retrospective');
    if (acts.length > 1) no(`ACT: more than one retrospective (${acts.map((f) => f.path).sort().join(', ')})`);
    if (acts.length === 1) {
      const last = (path) => col.history.reduce((n, c, i) => (c.paths.includes(path) ? i : n), -1);
      const at = last(acts[0].path);
      const ordered = [...plan, ...dos, ...live.filter((f) => caseRe.test(f.path))];
      for (const f of ordered) {
        const i = last(f.path);
        if (i < 0 || at < 0) dunno(`where ${f.path} or the ACT sits in the history`);
        else if (i > at) no(`ACT: ${f.path} changed in a later commit than the ACT`);
      }
    }
    return { name, status: fail ? 'does not qualify' : unknown ? 'not judged' : 'qualifies', missing: uniq(missing) };
  });
  const qualifiers = entries.filter((e) => e.status === 'qualifies').map((e) => e.name);
  const undeclared = uniq(host.map((c) => c.name).filter((n) => !declared.includes(n)));
  const next = qualifiers.length ? { collector: qualifiers[0] } : { collector: null, reason: entries.length ? 'no declared collector qualifies; each says what is missing' : 'there are no declared collectors' };
  return { collectors: entries, qualifiers, undeclared, next, problems };
}
if (process.argv[1]?.endsWith('pull-promotion.mjs') && process.argv.length >= 4) {
  const read = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch (e) { process.stderr.write(`could not read ${f}: ${e.message}\n`); process.exit(2); } };
  process.stdout.write(`${JSON.stringify(walkCollectors(read(process.argv[2]), read(process.argv[3])), null, 2)}\n`);
}
