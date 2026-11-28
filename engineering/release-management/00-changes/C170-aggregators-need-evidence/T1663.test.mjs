// Case release/T1663 tests: release/C170. A result other than success for any expected entry fails the aggregator; all expected entries success passes it.
import assert from 'node:assert/strict';
import { workflows, AGGREGATORS, runAggregator } from './fixture.mjs';
export const id = 'release/T1663';
export const tests = ['release/C170'];
export const title = 'A result other than success for any expected entry fails the aggregator; all expected entries success passes it.';
export async function run() {
  const ws = workflows();
  for (const [file, name, needs] of AGGREGATORS) {
    const j = ws.find((x) => x.file === file).jobs.find((x) => x.name === name); assert.ok(j, name);
    const ok = Object.fromEntries(needs.map((n) => [n, 'success']));
    assert.equal(runAggregator(j, ok).status, 0, name);
    for (const n of needs) for (const bad of ['failure', 'skipped', 'cancelled', 'neutral', '']) assert.equal(runAggregator(j, { ...ok, [n]: bad }).status, 1, `${name}: ${n} ${bad || 'empty'}`);
  }
}
