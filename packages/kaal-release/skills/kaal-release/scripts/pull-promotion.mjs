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
export function chooseNext(qualifiers, entries, declaration) {
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
// laneStep: the one advisory step of the promotion lane, a pure function of the facts it is given (pull/F39, F40, F41, F42).
// It returns wait, judge, open-promotion, open-sync or ready-for-cpo, and acts on nothing. A seat holder that fails re-qualification
// is replaced by chooseNext (the pull/C9 rule) on the remaining qualifiers. Doubtful input fails closed to judge.
const TEMPLATE = { 'open-promotion': { type: 'PROMOTION', chapters: ['Change', 'Why now'] }, 'open-sync': { type: 'SYNC', chapters: ['Change', 'Reason'] } };
// The registry (pull/F60 to F62) is the only source of stocks, routes and the pull type: the package holds no branch convention.
// {accepted: true, stocks: [{name, routes: [route...], pull?: 'select' | 'open-promotion', type?: <pull request type>}, ...]}, in delivery priority.
// A route is an exact name or a prefix ending in '/*' with something after it. Anything else makes the registry doubtful (fail closed).
const isId = (v) => typeof v === 'string' && v.trim() !== '';
const PULLS = ['select', 'open-promotion'];
const registryProblem = (reg) => {
  if (!reg || typeof reg !== 'object' || reg.accepted !== true) return 'the registry is missing or not accepted';
  if (!Array.isArray(reg.stocks)) return 'the registry stocks are not a list';
  for (const st of reg.stocks) {
    if (!st || typeof st !== 'object' || !isId(st.name)) return 'a registry stock has no name';
    if (!Array.isArray(st.routes) || !st.routes.every(isId)) return 'a registry stock has routes that are not a list of names';
    if (st.pull !== undefined && !PULLS.includes(st.pull)) return 'a registry stock has an unknown pull';
    if (st.type !== undefined && !isId(st.type)) return 'a registry stock has a type that is not a name';
  }
  return null;
};
const routed = (route, source) => (route.endsWith('/*') ? source.length > route.length - 1 && source.startsWith(route.slice(0, -1)) : source === route);
const stockOf = (reg, name) => (registryProblem(reg) ? undefined : reg.stocks.find((st) => st.name === name));
const typeOf = (st) => st.type ?? st.name;
const pulseProblem = (pulse) => {
  if (!pulse || typeof pulse !== 'object') return 'the lane has no pulse';
  const { open, closed, trigger, attempts, cap } = pulse;
  if (!Array.isArray(open) || !open.every((p) => p && isId(p.type) && isId(p.collector))) return 'the open pull requests are not a list of type and collector';
  if (!Array.isArray(closed) || !closed.every((p) => p && isId(p.type) && isId(p.collector) && isId(p.trigger))) return 'the closed pull requests are not a list of type, collector and trigger';
  if (!isId(trigger)) return 'the trigger is not an id';
  if (!Number.isSafeInteger(attempts) || attempts < 0) return 'the attempts are not a non-negative integer';
  if (!Number.isSafeInteger(cap) || cap < 1) return 'the cap is not a positive integer';
  return null;
};
export function laneStep(state = {}) {
  const { seat = null, report = {}, declaration = {}, behind = false, requalification, pulse, deliveries, registry } = state;
  const judge = (reason, judged) => ({ action: 'judge', reason, ...(judged?.length ? { judged } : {}) });
  const wait = (reason) => ({ action: 'wait', reason });
  const open = (action, collector) => {
    const bad = pulseProblem(pulse);
    if (bad) return judge(`judged: ${bad}`);
    const { type } = TEMPLATE[action];
    if (pulse.open.some((p) => p.type === type)) return wait(`a ${type} is already open`);
    if (pulse.closed.some((p) => p.type === type && p.trigger === pulse.trigger)) return wait(`a ${type} was already opened under this trigger`);
    if (pulse.attempts >= pulse.cap) return judge('judged: the attempt cap is reached');
    return { action, collector, ...TEMPLATE[action] };
  };
  const qualifiers = Array.isArray(report.qualifiers) ? report.qualifiers : [];
  // pull/F61, F62: the legacy next collector is auto-pulled only when a registered stock that opens promotions routes it; else it is judge-pulled.
  const fromNext = (next) => {
    if (next?.collector) {
      const covered = !registryProblem(registry) && registry.stocks.some((st) => st.pull === 'open-promotion' && st.routes.some((r) => routed(r, next.collector)));
      if (!covered) return { ...judge('judged: the collector is not covered by a registered stock', [next.collector]), judgePulled: [next.collector] };
      return open('open-promotion', next.collector);
    }
    return next?.judged?.length ? judge(next.reason ?? 'judged by the Owner', next.judged) : wait('no qualifier is waiting');
  };
  // pull/F43, F45, F61: with a free seat and deliveries, the first registered stock (in registry order) with a candidate whose stock verdict is PASS and whose
  // source a route of that stock covers. Several candidates in one stock go to the C9 choice, which judges without value and size. One admission lane.
  // A PASSing candidate no registered stock covers is judge-pulled: reported, never selected. The destination IN is not read (it applies at merge).
  const fromDeliveries = (list) => {
    if (!Array.isArray(list)) return judge('judged: the deliveries are not a list');
    const unknown = [];
    const judgePulled = [];
    const sound = !registryProblem(registry);
    const eligible = new Map((sound ? registry.stocks : []).map((st) => [st.name, []]));
    for (const d of list) {
      const valid = d && typeof d === 'object' && isId(d.class) && isId(d.name) && typeof d.source === 'string';
      if (!valid) { unknown.push(isId(d?.name) ? d.name : String(d?.name ?? d)); continue; }
      if (d.stock === 'FAIL') continue;
      if (d.stock !== 'PASS') { unknown.push(d.name); continue; }
      const st = stockOf(registry, d.class);
      if (st && st.routes.some((r) => routed(r, d.source))) eligible.get(d.class).push(d.name);
      else judgePulled.push(d.name);
    }
    const note = { ...(unknown.length ? { unknown } : {}), ...(judgePulled.length ? { judgePulled } : {}) };
    const admit = (st, result) => {
      const bad = pulseProblem(pulse);
      if (bad) return judge(`judged: ${bad}`);
      if (pulse.open.some((p) => registry.stocks.some((x) => typeOf(x) === p.type))) return wait('a delivery is already open');
      if (pulse.closed.some((p) => p.type === typeOf(st) && p.trigger === pulse.trigger)) return wait(`a ${typeOf(st)} was already opened under this trigger`);
      if (pulse.attempts >= pulse.cap) return judge('judged: the attempt cap is reached');
      return { ...result, ...note };
    };
    for (const st of sound ? registry.stocks : []) {
      const names = eligible.get(st.name);
      if (!names.length) continue;
      const next = chooseNext(names, [], declaration);
      if (!next.collector) return judge(next.reason ?? 'judged by the Owner', next.judged ?? names);
      if (st.pull === 'open-promotion') return admit(st, { action: 'open-promotion', collector: next.collector, ...TEMPLATE['open-promotion'] });
      return admit(st, { action: 'select', class: st.name, name: next.collector });
    }
    if (judgePulled.length) return { ...judge('judged: only candidates no registered stock covers are ready', judgePulled), judgePulled, ...(unknown.length ? { unknown } : {}) };
    return unknown.length ? judge('judged: no candidate is eligible and some are unknown', unknown) : wait('no delivery is eligible');
  };
  if (!seat) return deliveries === undefined ? fromNext(report.next) : fromDeliveries(deliveries);
  if (behind) return open('open-sync', seat.collector);
  if (requalification === 'PASS') return { action: 'ready-for-cpo', collector: seat.collector };
  if (requalification !== 'FAIL') return wait('the holder is not re-qualified at its exact head');
  const rest = qualifiers.filter((n) => n !== seat.collector);
  if (!rest.length) return wait('the holder failed and no other qualifier remains');
  return fromNext(chooseNext(rest, [], declaration));
}
if (process.argv[1]?.endsWith('pull-promotion.mjs') && process.argv.length >= 4) {
  const read = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch (e) { process.stderr.write(`could not read ${f}: ${e.message}\n`); process.exit(2); } };
  process.stdout.write(`${JSON.stringify(walkCollectors(read(process.argv[2]), read(process.argv[3])), null, 2)}\n`);
}
