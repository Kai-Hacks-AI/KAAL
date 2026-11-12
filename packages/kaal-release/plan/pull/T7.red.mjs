// Case pull/T7 tests: pull/F9
import assert from 'node:assert/strict';
import { declaration, facts, flow, lifecycle, promotion, pullPromotion, statuses } from './fixtures.mjs';
export const id = 'pull/T7';
export const tests = ['pull/F9'];
export const title = 'validation is Review\'s: each landed piece of each Change must have been approved at the version it landed at; no review is unknown, an approval of another version or a change request fails';
export async function run() {
  const run = (over) => pullPromotion(facts({ pieces: [...lifecycle({ DO: over }), promotion(20)] }), declaration(), flow());
  assert.equal(statuses(await run({})).validation, 'PASS');

  const none = await run({ review: null });
  assert.equal(statuses(none).validation, 'UNKNOWN', 'a piece without a review passes');
  assert.deepEqual(none.judgments.find((j) => j.id === 'validation').missing, ['#11'], 'the unreviewed piece is not named');
  assert.equal(none.verdict, 'NOT JUDGED');

  const absent = lifecycle(); delete absent[1].review;
  assert.equal(statuses(await pullPromotion(facts({ pieces: [...absent, promotion(20)] }), declaration(), flow())).validation, 'UNKNOWN', 'an absent review fact is a pass');

  const moved = await run({ review: { state: 'approved', at: 'older' } });
  assert.equal(statuses(moved).validation, 'FAIL', 'an approval of an older version covers what landed');
  assert.match(moved.judgments.find((j) => j.id === 'validation').because, /older/);

  const changes = await run({ review: { state: 'changes', at: 'h11' } });
  assert.equal(statuses(changes).validation, 'FAIL');
  assert.equal(changes.judgments.find((j) => j.id === 'validation').owner, 'Review');
}
