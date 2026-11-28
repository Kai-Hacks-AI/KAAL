// Case release/T1664 tests: release/C170. The reported set equals the expected set exactly: an unexpected entry fails the aggregator even when every expected one succeeded.
import assert from 'node:assert/strict';
import { workflows, AGGREGATORS, runAggregator } from './fixture.mjs';
export const id = 'release/T1664';
export const tests = ['release/C170'];
export const title = 'The reported set equals the expected set exactly: an unexpected entry fails the aggregator even when every expected one succeeded.';
export async function run() {
  const ws = workflows();
  for (const [file, name, needs] of AGGREGATORS) {
    const j = ws.find((x) => x.file === file).jobs.find((x) => x.name === name); assert.ok(j, name);
    const ok = Object.fromEntries(needs.map((n) => [n, 'success']));
    assert.equal(runAggregator(j, { ...ok, extra: 'success' }).status, 1, `${name}: unexpected entry, all expected succeeded`);
    const partial = { ...ok, extra: 'success' }; delete partial[needs[0]];
    assert.equal(runAggregator(j, partial).status, 1, `${name}: unexpected entry, one expected missing`);
    assert.equal(runAggregator(j, ok).status, 0, `${name}: exact set passes`);
  }
}
