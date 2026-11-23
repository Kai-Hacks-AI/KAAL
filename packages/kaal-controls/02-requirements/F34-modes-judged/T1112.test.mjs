// Case controls/T1112 tests: controls/F34
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const PKG = join(repo, 'packages/kaal-controls');
const S = join(PKG, 'skills/kaal-controls/scripts');
const judge = async (o) => { const f = join(S, 'judge-mode.mjs'); assert.ok(existsSync(f), 'scripts/judge-mode.mjs is absent'); const { judgeMode } = await import(pathToFileURL(f).href); return judgeMode(o); };

export const id = 'controls/T1112';
export const tests = ['controls/F34'];
export const title = 'a ratchet fails a baseline that grew, an allowance kept for what is resolved, and a resolved finding that returns';
export async function run() {
  const grew = await judge({ mode: 'ratchet', findings: ['a', 'c'], baseline: ['a', 'c'], previous: ['a'] });
  assert.deepEqual([grew.verdict, grew.blocked], ['FAIL', true], 'a baseline that grew was accepted');
  assert.ok(grew.reasons.includes('baseline-grew') && grew.grew.includes('c'), 'growth was not named');
  const stale = await judge({ mode: 'ratchet', findings: ['a'], baseline: ['a', 'b'], previous: ['a', 'b'] });
  assert.deepEqual([stale.verdict, stale.blocked], ['FAIL', true], 'an allowance kept for a resolved finding was accepted');
  assert.ok(stale.reasons.includes('stale-allowance') && stale.stale.includes('b'), 'the stale allowance was not named');
  // improvement, accepted: b is resolved and its allowance removed
  const improved = await judge({ mode: 'ratchet', findings: ['a'], baseline: ['a'], previous: ['a', 'b'] });
  assert.equal(improved.verdict, 'PASS');
  // attempted rollback: b returns against the advanced reference
  const back = await judge({ mode: 'ratchet', findings: ['a', 'b'], baseline: ['a'], previous: improved.next });
  assert.deepEqual([back.verdict, back.new], ['FAIL', ['b']], 'a resolved finding that returned was not blocked');
  // attempted rollback by putting the allowance back
  const readded = await judge({ mode: 'ratchet', findings: ['a', 'b'], baseline: ['a', 'b'], previous: improved.next });
  assert.ok(readded.blocked && readded.reasons.includes('baseline-grew'), 'putting a resolved allowance back was accepted');
}
