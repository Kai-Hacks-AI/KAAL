// Case pull/T51 tests: pull/F50
import assert from 'node:assert/strict';
import { script, classes } from './lib.mjs';
export const id = 'pull/T51';
export const tests = ['pull/F50'];
export const title = 'every head of a delivery class is a candidate and nothing else is';

export async function run() {
  const { gatherDeliveries } = await script();
  const heads = ['hotfix/x', 'wire/y', 'kaal/a/b', 'feature/z', 'claude/t', 'hotfix/'].map((ref, i) => ({ ref, sha: `s${i}` }));
  const r = gatherDeliveries({ heads, checks: [], classes });
  const got = r.deliveries.map((d) => [d.class, d.source, d.name, d.sha]);
  assert.deepEqual(got, [['HOTFIX', 'hotfix/x', 'x', 's0'], ['WIRE', 'wire/y', 'y', 's1'], ['KAAL', 'kaal/a/b', 'a/b', 's2']]);
  for (const d of r.deliveries) assert.ok(['PASS', 'FAIL', 'UNKNOWN'].includes(d.out) && ['PASS', 'FAIL', 'UNKNOWN'].includes(d.in), 'a side is not a verdict');
}
