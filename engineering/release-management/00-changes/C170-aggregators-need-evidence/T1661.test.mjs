// Case release/T1661 tests: release/C170. With no result at all, each aggregator fails.
import assert from 'node:assert/strict';
import { workflows, AGGREGATORS, runAggregator } from './fixture.mjs';
export const id = 'release/T1661';
export const tests = ['release/C170'];
export const title = 'With no result at all, each aggregator fails.';
export async function run() {
  const ws = workflows();
  for (const [file, name, needs] of AGGREGATORS) {
    const j = ws.find((x) => x.file === file).jobs.find((x) => x.name === name); assert.ok(j, name);
    const ok = Object.fromEntries(needs.map((n) => [n, 'success']));
    assert.equal(runAggregator(j, {}).status, 1, `${name}: empty`);
    assert.equal(runAggregator(j, ok).status, 0, `${name}: control, all success passes`);
  }
}
