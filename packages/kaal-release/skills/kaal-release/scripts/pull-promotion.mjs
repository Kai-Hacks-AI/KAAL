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
  const lifecycle = declaration.lifecycle ?? [];
  const checkNames = declaration.checks ?? [];
  const host = facts.collectors ?? [];
  const entries = declared.map((name) => {
    const col = host.find((c) => c.name === name);
    if (!col) return { name, status: 'not judged', missing: ['the collector on the host'], changes: [] };
    const missing = []; let unknown = false; let fail = false;
    const deliveries = (facts.deliveries ?? []).filter((d) => d.collector === name);
    let since = null;
    if (deliveries.length) { if (deliveries.some((d) => !d.landedAt)) { unknown = true; missing.push('the landing time of the last delivery'); } else since = deliveries.map((d) => d.landedAt).sort().pop(); }
    const mine = (facts.pieces ?? []).filter((p) => p.into === name && p.state !== 'dropped' && p.state !== 'open');
    const fresh = unknown ? [] : mine.filter((p) => since === null || (p.landedAt && p.landedAt > since));
    const changes = {};
    for (const p of fresh) {
      if (!p.change) { unknown = true; missing.push(`${p.ref} names no Change`); continue; }
      (changes[p.change] ??= new Set()).add(p.type);
    }
    const list = Object.keys(changes).sort().map((id) => {
      const gone = lifecycle.filter((t) => !changes[id].has(t));
      for (const t of gone) { fail = true; missing.push(`${t} of ${id}`); }
      return { id, complete: gone.length === 0, missing: gone };
    });
    if (!unknown && !list.length) { fail = true; missing.push('a Change in the collector not yet delivered'); }
    if (!col.checks) { unknown = true; missing.push('the checks of the collector head'); }
    else for (const n of checkNames) {
      const runs = col.checks.filter((c) => c.name === n);
      if (!runs.length) { unknown = true; missing.push(`check ${n} has no run`); }
      else if (runs.some((r) => r.conclusion === 'failure')) { fail = true; missing.push(`check ${n}: failure`); }
      else if (runs.some((r) => r.conclusion !== 'success')) { unknown = true; missing.push(`check ${n}: ${runs[0].conclusion}`); }
    }
    return { name, status: fail ? 'does not qualify' : unknown ? 'not judged' : 'qualifies', missing: uniq(missing), changes: list };
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
