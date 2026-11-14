// pull Promotion: for each collector the declaration lists, in the declared order, says whether the collector has fulfilled its PDCA.
// The collector is the unit, judged from its file state: the effective delta against main, the tree at its head and its history.
// It qualifies when its delta is not empty, its head tree holds PLAN and DO files, every expected Test Case has a green latest execution at the exact head, and
// exactly one 4L retrospective concludes the collected work (the Change-history retrospectives a declaration names are not counted). Order is the history's (ancestry), never a time. Missing, stale or
// ambiguous evidence is "not judged" and never qualifies. Advisory: it names the qualifiers and the one that moves next (the highest value density, else judged), and
// authorizes or recommends nothing. Read-only, deterministic, no host access.
// Usage: node pull-promotion.mjs <facts.json> <declaration.json>
import { readFileSync } from 'node:fs';
const uniq = (a) => [...new Set(a)].sort();
const isList = (v) => Array.isArray(v) && v.length > 0;
const any = (patterns, path) => patterns.some((p) => new RegExp(p).test(path));
const patterns = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v : []);
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
    if (!patterns(ev.cases?.files).length) undecl.push('cases evidence');
    if (!patterns(ev.act?.files).length || !isList(ev.act?.headings)) undecl.push('act evidence (files and 4L headings)');
  }
  for (const u of undecl) problems.push(`the declaration lists no ${u}`);
  const host = facts.collectors ?? [];
  const entries = declared.map((name) => {
    const col = host.find((c) => c.name === name);
    const scope = declaration.collectors.find((c) => c.name === name).scope;
    if (!col) return { name, status: 'not judged', missing: ['the collector on the host'] };
    if (undecl.length) return { name, status: 'not judged', missing: undecl.map((u) => `the ${u}`) };
    const missing = []; let unknown = false; let fail = false;
    const no = (m) => { fail = true; missing.push(m); };
    const dunno = (m) => { unknown = true; missing.push(m); };
    if (scope !== undefined && !(isList(scope) && scope.every((p) => typeof p === 'string'))) return { name, status: 'not judged', missing: ['the scope of the collector (a non-empty list of path patterns)'] };
    const inScope = (path) => scope === undefined || any(scope, path);
    if (!Array.isArray(col.delta) || !Array.isArray(col.tree) || !Array.isArray(col.history)) return { name, status: 'not judged', missing: ['the delta, the tree and the history of the collector'] };
    if (col.history.length && col.history.at(-1).id !== col.at) dunno('the history does not end at the head being qualified');
    const live = col.delta.filter((f) => f.status !== 'removed' && inScope(f.path));
    const tree = col.tree.filter(inScope);
    if (!col.delta.length) no('files that differ from main: the delta is empty');
    else if (!col.delta.some((f) => inScope(f.path))) no('files that differ from main inside the scope of the collector: none');
    const outside = uniq(col.delta.filter((f) => !inScope(f.path)).map((f) => f.path));
    if (outside.length) no(`scope: files of the delta outside the scope of the collector (${outside.slice(0, 5).join(', ')}${outside.length > 5 ? `, and ${outside.length - 5} more` : ''})`);
    const plan = tree.filter((p) => any(ev.plan, p));
    const dos = tree.filter((p) => any(ev.do, p));
    if (col.delta.length && !plan.length) no('PLAN: no file of the tree matches the plan evidence');
    if (col.delta.length && !dos.length) no('DO: no file of the tree matches the do evidence');
    const caseRes = patterns(ev.cases.files).map((p) => new RegExp(p));
    const isCase = (path) => caseRes.some((re) => re.test(path));
    const idsIn = (paths) => paths.flatMap((p) => caseRes.map((re) => re.exec(p)?.[1]).filter(Boolean));
    const unnamed = tree.filter((p) => /\.test\.mjs$/.test(p) && !isCase(p) && !any(patterns(ev.cases.other), p));
    if (unnamed.length) dunno(`test files that are neither a Case nor declared otherwise (${unnamed.slice(0, 5).join(', ')}${unnamed.length > 5 ? `, and ${unnamed.length - 5} more`: ''})`);
    const expected = uniq([...idsIn(tree), ...(ev.cases.required ?? [])]);
    for (const id of ev.cases.required ?? []) if (!idsIn(tree).includes(id)) no(`Test Case ${id} is required and the tree has no such Case`);
    if (!expected.length) dunno('an expected Test Case in the tree');
    for (const id of expected) {
      if ((ev.cases.required ?? []).includes(id) && !idsIn(tree).includes(id)) continue;
      const runs = (col.executions ?? []).filter((e) => e.case === id && e.head === col.at).sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
      const last = runs.at(-1);
      if (!last) dunno(`Test Case ${id} has no execution at the current head`);
      else if (last.conclusion === 'failure') no(`Test Case ${id}: failure`);
      else if (last.conclusion !== 'success') dunno(`Test Case ${id}: ${last.conclusion}`);
    }
    const isHistory = (path) => any(patterns(ev.act.history), path);
    const candidates = live.filter((f) => any(patterns(ev.act.files), f.path) && !isHistory(f.path));
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
      const ordered = uniq([...col.history.flatMap((c) => c.paths).filter(inScope).filter((p) => any(ev.plan, p) || any(ev.do, p) || isCase(p)), ...live.filter((f) => isHistory(f.path)).map((f) => f.path)]);
      for (const f of ordered) {
        const i = last(f);
        if (i < 0 || at < 0) dunno(`where ${f} or the ACT sits in the history`);
        else if (i > at) no(`ACT: ${f} changed in a later commit than the ACT`);
      }
    }
    return { name, status: fail ? 'does not qualify' : unknown ? 'not judged' : 'qualifies', missing: uniq(missing) };
  });
  const qualifiers = entries.filter((e) => e.status === 'qualifies').map((e) => e.name);
  const undeclared = uniq(host.map((c) => c.name).filter((n) => !declared.includes(n)));
  for (const c of declaration.collectors ?? []) {
    for (const f of ['value', 'size']) if (c[f] !== undefined && !(Number.isSafeInteger(c[f]) && c[f] > 0)) problems.push(`${c.name}: ${f} is not a positive integer`);
    if (c.unit !== undefined && !(typeof c.unit === 'string' && c.unit.trim())) problems.push(`${c.name}: unit is not a non-empty text`);
  }
  return { collectors: entries, qualifiers, undeclared, next: chooseNext(qualifiers, entries, declaration), problems };
}
// next: the one qualifier; else the strictly highest value density (value / size, exact by cross-multiplication) when every qualifier
// has a valid value, size and the same unit; else judged (collector null, the candidates named). A missing size is never defaulted.
function chooseNext(qualifiers, entries, declaration) {
  if (!qualifiers.length) return { collector: null, reason: entries.length ? 'no declared collector qualifies; each says what is missing' : 'there are no declared collectors' };
  if (qualifiers.length === 1) return { collector: qualifiers[0] };
  const by = new Map((declaration.collectors ?? []).map((c) => [c.name, c]));
  const ok = (c) => c && [c.value, c.size].every((n) => Number.isSafeInteger(n) && n > 0) && typeof c.unit === 'string' && c.unit.trim();
  const rows = qualifiers.map((n) => by.get(n));
  if (!rows.every(ok)) return { collector: null, judged: qualifiers, reason: 'judged by the Owner: a qualifier lacks a valid value, size or unit' };
  if (new Set(rows.map((c) => c.unit)).size > 1) return { collector: null, judged: qualifiers, reason: 'judged by the Owner: the qualifiers do not share one size unit and counting method' };
  const beats = (a, b) => BigInt(a.value) * BigInt(b.size) > BigInt(b.value) * BigInt(a.size);
  const best = rows.filter((c) => rows.every((o) => o === c || !beats(o, c)));
  if (best.length === 1) return { collector: best[0].name };
  return { collector: null, judged: best.map((c) => c.name), reason: 'judged by the Owner: the highest value densities tie' };
}
if (process.argv[1]?.endsWith('pull-promotion.mjs') && process.argv.length >= 4) {
  const read = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch (e) { process.stderr.write(`could not read ${f}: ${e.message}\n`); process.exit(2); } };
  process.stdout.write(`${JSON.stringify(walkCollectors(read(process.argv[2]), read(process.argv[3])), null, 2)}\n`);
}
