// Case testing/T360 tests: testing/F134, testing/F135. It checks the shape of the answers, never whether a rejection is right.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { PKG, OWN_CASES, answerOf, answerProblems, trialKey, trialRuns } from './lib.mjs';
export const id = 'testing/T360';
export const tests = ['testing/F134', 'testing/F135'];
export const title = 'the trial key marks its Case claims, and every answer carries rejectsCase exactly where the key says the claim is a Case';
export function run() {
  const runs = trialRuns();
  const { key } = trialKey();
  assert.ok(key.every((k) => typeof k.isCase === 'boolean'), 'every claim of the key says whether it is a proposed Case');
  const cases = key.filter((k) => k.isCase);
  assert.ok(cases.length >= 2 && key.length - cases.length >= 2, 'at least two Case claims and two other claims');
  const real = cases.filter((k) => typeof k.source === 'string' && /\.mjs$/.test(k.source) && !OWN_CASES.some((o) => k.source.startsWith(`packages/kaal-testing/${o}`)) && existsSync(join(PKG, '../..', k.source)));
  assert.ok(real.length >= 1, 'at least one Case claim names a Case file that exists in the repository and is not a Case of this Change');
  for (const k of cases) assert.equal(typeof k.rejectsCase, 'boolean', `${k.id}: the key states the author's expectation of rejectsCase`);
  for (const r of runs) {
    for (const k of key) {
      const a = answerOf(r, k.id);
      const at = `${r.run}/${r.arm} ${k.id}`;
      assert.ok(a, `${at}: answered`);
      assert.deepEqual(answerProblems(a), [], at);
      if (k.isCase) assert.equal(typeof a.rejectsCase, 'boolean', `${at}: a Case claim carries rejectsCase as true or false`);
      else assert.equal(a.rejectsCase ?? null, null, `${at}: a claim that is no Case carries rejectsCase as null`);
    }
  }
}
