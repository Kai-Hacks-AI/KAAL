// Case pull/T5 tests: pull/F7
import assert from 'node:assert/strict';
import { bad, declaration, facts, flow, landed, ok, promotion, pullPromotion, running, lifecycle } from './fixtures.mjs';
export const id = 'pull/T5';
export const tests = ['pull/F7'];
export const title = 'each check is judged by the owner the declaration gives it: a failure traces to that owner, a running or absent check is unknown, an unowned check is not judged, and a check reported twice with different conclusions is unknown';
export async function run() {
  const piece = (checks) => promotion(20, 'col-a', { checks });
  const run = (checks, decl = declaration()) => pullPromotion(facts({ pieces: [...lifecycle(), piece(checks)] }), decl, flow());

  const failed = await run([ok('build'), bad('suite'), ok('guard'), ok('fresh')]);
  const verification = failed.judgments.find((j) => j.id === 'verification');
  assert.equal(verification.status, 'FAIL');
  assert.equal(verification.owner, 'Testing', 'the failure is not traced to the declared owner');
  assert.deepEqual(verification.evidence, ['suite'], 'the evidence is not the failing check');
  assert.equal(failed.judgments.find((j) => j.id === 'protection').status, 'PASS', 'one owner\'s failure spills over to another owner');

  const guard = await run([ok('build'), ok('suite'), bad('guard'), ok('fresh')]);
  assert.equal(guard.judgments.find((j) => j.id === 'protection').owner, 'Guard');
  assert.equal(guard.judgments.find((j) => j.id === 'protection').status, 'FAIL');

  const pending = await run([ok('build'), running('suite'), ok('guard'), ok('fresh')]);
  assert.equal(pending.judgments.find((j) => j.id === 'verification').status, 'UNKNOWN', 'a running check is a pass or a failure');

  // a declared check with no run at all is missing evidence, named
  const absent = await run([ok('build'), ok('guard'), ok('fresh')]);
  const gone = absent.judgments.find((j) => j.id === 'verification');
  assert.equal(gone.status, 'UNKNOWN', 'an absent check is a pass');
  assert.deepEqual(gone.missing, ['suite']);

  // a check that no owner is declared for is neither passed nor failed: it is reported
  const stranger = await run([ok('build'), ok('suite'), ok('guard'), ok('fresh'), bad('mystery')]);
  assert.equal(stranger.verdict, 'NOT JUDGED', 'an unowned failing check is ignored or blocks on a guess');
  assert.equal(stranger.judgments.find((j) => j.id === 'attribution').status, 'UNKNOWN');
  assert.ok(stranger.notJudged.some((n) => /mystery/.test(JSON.stringify(n))), 'the unowned check is not reported');

  // one name twice with different conclusions cannot be reduced here (the supplier keeps the newest run): it is unknown, never the better of the two
  const twice = await run([bad('suite'), ok('suite'), ok('build'), ok('guard'), ok('fresh')]);
  assert.equal(twice.judgments.find((j) => j.id === 'verification').status, 'UNKNOWN', 'a check reported twice with different conclusions is resolved by guess');
}
