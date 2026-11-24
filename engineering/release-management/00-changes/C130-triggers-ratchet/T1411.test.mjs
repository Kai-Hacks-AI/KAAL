// Case release/T1411 tests: release/C130
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { judge } from '../../05-src/triggers/verify-triggers.mjs';
export const id = 'release/T1411';
export const tests = ['release/C130'];
export const title = 'the allowance is read from the base and never from the head: a head that carries a baseline of its own, or a file naming its use as allowed, does not widen it';
export async function run() {
  const f = (n) => `.github/workflows/${n}.yml`;
  const base = { [f('a')]: 'on:\n  pull_request:\n' };
  const head = { ...base, [f('c')]: 'on:\n  pull_request_target:\n', baseline: JSON.stringify([f('c')]), 'baseline.json': JSON.stringify([f('c')]), previous: JSON.stringify([f('c')]) };
  assert.equal(judge({ base, head }).verdict, 'FAIL');
  assert.equal(judge({ base, head, baseline: [f('c')], previous: [f('c')] }).verdict, 'FAIL', 'an argument of that name is not read');
  const src = readFileSync(new URL('../../05-src/triggers/verify-triggers.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /baseline\.json|--baseline|--previous/);
}
