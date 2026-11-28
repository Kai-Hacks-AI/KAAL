// Case release/T1662 tests: release/C170. With a partial result set, each aggregator fails and names the missing entry.
import assert from 'node:assert/strict';
import { workflows, AGGREGATORS, runAggregator } from './fixture.mjs';
export const id = 'release/T1662';
export const tests = ['release/C170'];
export const title = 'With a partial result set, each aggregator fails and names the missing entry.';
export async function run() {
  const ws = workflows();
  for (const [file, name, needs] of AGGREGATORS) {
    const j = ws.find((x) => x.file === file).jobs.find((x) => x.name === name); assert.ok(j, name);
    const ok = Object.fromEntries(needs.map((n) => [n, 'success']));
    for (const missing of needs) {
      const partial = { ...ok }; delete partial[missing];
      const r = runAggregator(j, partial); assert.equal(r.status, 1, `${name}: ${missing} absent`); assert.match(r.stderr, new RegExp(missing + ': absent'));
    }
  }
}
