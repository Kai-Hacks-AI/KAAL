// Case pull/T2 tests: pull/F4
import assert from 'node:assert/strict';
import { allGreen, collector, declaration, facts, flow, landed, promotion, pullPromotion, bad, running, ok } from './fixtures.mjs';
export const id = 'pull/T2';
export const tests = ['pull/F4'];
export const title = 'the verdict is READY only when every judgment passes, BLOCKED when any fails, and NOT JUDGED when none fails and any is unknown; unknown never passes';
export async function run() {
  const ready = await pullPromotion(facts({ pieces: [landed(10), promotion(20)] }), declaration(), flow());
  assert.equal(ready.verdict, 'READY');
  assert.ok(ready.judgments.every((j) => j.status === 'PASS'), 'a READY verdict holds a judgment that did not pass');

  // one failing judgment blocks, whatever else is unknown
  const failing = await pullPromotion(facts({ pieces: [landed(10), promotion(20, 'col-a', { checks: [ok('build'), bad('suite'), ok('guard'), running('fresh')] })] }), declaration(), flow());
  assert.equal(failing.verdict, 'BLOCKED', 'a failed check does not block, because another judgment is unknown');

  // nothing fails, one thing is unknown: not judged, never ready
  const unknown = await pullPromotion(facts({ pieces: [landed(10), promotion(20, 'col-a', { checks: [ok('build'), ok('suite'), ok('guard'), running('fresh')] })] }), declaration(), flow());
  assert.equal(unknown.verdict, 'NOT JUDGED', 'a running check is treated as a pass or a failure');
  assert.equal(unknown.judgments.find((j) => j.id === 'sequencing').status, 'UNKNOWN');

  // no evidence at all is never a pass
  const empty = await pullPromotion(facts({ pieces: [landed(10)] }), declaration(), flow());
  assert.equal(empty.verdict, 'NOT JUDGED', 'a collector without any check evidence is ready');
  assert.ok(empty.judgments.filter((j) => j.status === 'UNKNOWN').every((j) => j.missing.length > 0), 'an unknown judgment does not say what is missing');
  assert.ok(empty.judgments.every((j) => typeof j.owner === 'string' && j.owner.length), 'a judgment does not name its owner');
  assert.deepEqual(empty.judgments.map((j) => j.id), ['increment', 'verification', 'protection', 'sequencing', 'validation', 'attribution'], 'the judgments or their order differ');
}
