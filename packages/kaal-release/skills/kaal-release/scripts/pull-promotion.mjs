// pull Promotion: for each collector the declaration lists, in the declared order, says whether it has fulfilled its PDCA.
// A collector qualifies when every Change in it not yet delivered has PLAN, DO and ACT landed in it and every declared
// Check is green on its head. Missing evidence is "not judged" and never qualifies. The output is advisory: it names the
// qualifiers and the first one that moves next, and authorizes or recommends nothing. Read-only, deterministic, no host access.
// Usage: node pull-promotion.mjs <facts.json> <declaration.json>
import { readFileSync } from 'node:fs';
const uniq = (a) => [...new Set(a)].sort();
export function walkCollectors(facts, declaration) {
  const problems = [];
  const declared = (declaration.collectors ?? []).map((c) => c.name);
  if (!declared.length) problems.push('the declaration lists no collectors');
  // An absent or empty lifecycle or Check declaration would make every collector qualify vacuously: it is not judged instead.
  const lifecycle = Array.isArray(declaration.lifecycle) ? declaration.lifecycle : [];
  const checkNames = Array.isArray(declaration.checks) ? declaration.checks : [];
  const undeclared_ = [];
  if (!lifecycle.length) { undeclared_.push('the lifecycle declaration (the phases that make PDCA)'); problems.push('the declaration lists no lifecycle phases'); }
  if (!checkNames.length) { undeclared_.push('the checks declaration (the Check checks)'); problems.push('the declaration lists no checks'); }
  const host = facts.collectors ?? [];
  const entries = declared.map((name) => {
    const col = host.find((c) => c.name === name);
    if (!col) return { name, status: 'not judged', missing: ['the collector on the host'], changes: [] };
    const missing = [...undeclared_]; let unknown = undeclared_.length > 0; let fail = false;
    const deliveries = (facts.deliveries ?? []).filter((d) => d.collector === name);
    let since = null;
    if (deliveries.length) { if (deliveries.some((d) => !d.landedAt)) { unknown = true; missing.push('the landing time of the last delivery'); } else since = deliveries.map((d) => d.landedAt).sort().pop(); }
    const pieces = (facts.pieces ?? []).filter((p) => p.into === name && p.state !== 'dropped');
    const mine = pieces.filter((p) => p.state !== 'open');
    const fresh = unknown ? [] : mine.filter((p) => since === null || (p.landedAt && p.landedAt > since));
    const changes = {}; const outstanding = new Set();
    // An open piece is outstanding work of its Change: its Change stays in the evidence and its phase is not landed.
    for (const p of pieces.filter((q) => q.state === 'open')) {
      if (!p.change) { unknown = true; missing.push(`${p.ref} is open and names no Change`); continue; }
      changes[p.change] ??= new Set();
      outstanding.add(p.change); fail = true;
      missing.push(`${p.type} ${p.ref} of ${p.change} is open`);
    }
    for (const p of fresh) {
      if (!p.change) { unknown = true; missing.push(`${p.ref} names no Change`); continue; }
      (changes[p.change] ??= new Set()).add(p.type);
    }
    const list = Object.keys(changes).sort().map((id) => {
      const gone = lifecycle.filter((t) => !changes[id].has(t));
      for (const t of gone) { fail = true; missing.push(`${t} of ${id}`); }
      return { id, complete: gone.length === 0 && !outstanding.has(id), missing: gone };
    });
    if (!unknown && !list.length) { fail = true; missing.push('a Change in the collector not yet delivered'); }
    if (!col.checks) { unknown = true; missing.push('the checks of the collector head'); }
    else for (const n of checkNames) {
      const runs = col.checks.filter((c) => c.name === n);
      if (!runs.length) { unknown = true; missing.push(`check ${n} has no run`); }
      else if (runs.some((r) => r.conclusion === 'failure')) { fail = true; missing.push(`check ${n}: failure`); }
      else if (runs.some((r) => r.conclusion !== 'success')) { unknown = true; missing.push(`check ${n}: ${runs[0].conclusion}`); }
    }
    const status = undeclared_.length ? 'not judged' : fail ? 'does not qualify' : unknown ? 'not judged' : 'qualifies';
    return { name, status, missing: uniq(missing), changes: list };
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
