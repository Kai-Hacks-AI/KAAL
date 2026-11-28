// Case release/T1660 tests: release/C170. Each aggregator names its expected entries in its own text, and the list equals its needs.
import assert from 'node:assert/strict';
import { workflows, AGGREGATORS, runAggregator } from './fixture.mjs';
export const id = 'release/T1660';
export const tests = ['release/C170'];
export const title = 'Each aggregator names its expected entries in its own text, and the list equals its needs.';
export async function run() {
  const ws = workflows();
  for (const [file, name, needs] of AGGREGATORS) {
    const j = ws.find((x) => x.file === file).jobs.find((x) => x.name === name); assert.ok(j, name);
    const ok = Object.fromEntries(needs.map((n) => [n, 'success']));
    const expected = /EXPECTED: "([^"]*)"/.exec(j.lines.join('\n'))?.[1]?.split(' ');
    assert.deepEqual(expected, needs, `${name}: expected list`); assert.deepEqual(j.needs, expected, `${name}: needs equals expected`);
  }
}
