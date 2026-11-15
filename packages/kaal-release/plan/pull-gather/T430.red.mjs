// Case pull/T430 tests: pull/F50
import assert from 'node:assert/strict';
import { pkg, facts, cand } from './lib.mjs';
export const id = 'pull/T430';
export const tests = ['pull/F50'];
export const title = 'normalized stock items become deliveries, and nothing is guessed';

export async function run() {
  const { resolveDeliveries } = await pkg();
  const input = facts({ candidates: [cand('a', 'HOTFIX'), cand('b', 'WIRE'), cand('c', 'KAAL'), cand('d', 'OTHER')] });
  const copy = JSON.stringify(input);
  const r = resolveDeliveries(input);
  assert.deepEqual(r.deliveries.map((d) => [d.class, d.source, d.name]), [['HOTFIX', 'a', 'a'], ['WIRE', 'b', 'b'], ['KAAL', 'c', 'c']]);
  assert.ok(r.findings.some((f) => /OTHER/.test(f)), 'the undeclared class was not reported');
  for (const d of r.deliveries) for (const f of ['value', 'size', 'unit']) assert.equal(d[f], undefined, `${f} was invented`);
  assert.equal(JSON.stringify(input), copy, 'the input was changed');
  const bad = resolveDeliveries({ classes: 'nope' });
  assert.deepEqual(bad.deliveries, []);
  assert.ok(bad.findings.length > 0);
}
