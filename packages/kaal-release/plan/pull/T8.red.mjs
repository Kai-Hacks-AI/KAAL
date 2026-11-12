// Case pull/T8 tests: pull/F10
import assert from 'node:assert/strict';
import { bad, collector, declaration, facts, flow, landed, ok, promotion, pullPromotion, lifecycle } from './fixtures.mjs';
export const id = 'pull/T8';
export const tests = ['pull/F10'];
export const title = 'the recommendation is one next action in analyze Flow\'s words: OPEN for a ready collector without a promotion, the flow\'s own finding when a promotion exists, REVISE naming the owner when blocked, nothing when not judged, escalate on a hold';
export async function run() {
  // ready, no promotion piece yet, the lane is this collector's: OPEN the promotion, for the author, nothing executed
  const open = await pullPromotion(facts({ pieces: [...lifecycle()] }), declaration(), flow(), 'col-a');
  // without a promotion piece no check evidence exists on the promotion: carry it on the collector
  const withHead = await pullPromotion(facts({ collectors: [collector('col-a', { checks: [ok('build'), ok('suite'), ok('guard'), ok('fresh')] })], pieces: [...lifecycle()] }), declaration(), flow(), 'col-a');
  assert.equal(withHead.verdict, 'READY', 'the checks of the collector head are not evidence');
  assert.equal(withHead.next.action, 'OPEN');
  assert.equal(withHead.next.kind, 'promotion');
  assert.equal(withHead.next.target, 'col-a');
  assert.equal(withHead.next.authority, 'author');
  assert.equal(withHead.next.status, 'ready');
  assert.equal(open.next.action, null, 'a collector without any check evidence is recommended for promotion');
  assert.ok(open.next.missing.length > 0, 'the missing prerequisites are not listed');

  // ready and the promotion exists: analyze Flow's finding for it is the recommendation, not a second OPEN
  const finding = { rank: 1, action: 'REVIEW', target: '#20', layer: 'promotion', kind: 'promotion', pair: 'col-a', status: 'ready', authority: 'reviewer', reason: 'no approval at the current version' };
  const existing = await pullPromotion(facts({ pieces: [...lifecycle(), promotion(20)] }), declaration(), flow({ actions: [finding] }), 'col-a');
  assert.equal(existing.verdict, 'READY');
  assert.equal(existing.next.action, 'REVIEW');
  assert.equal(existing.next.target, '#20');
  assert.equal(existing.next.source, 'flow', 'the recommendation is not traced to analyze Flow');

  // ready but the lane is another collector's: wait on it, and say on what
  const waits = await pullPromotion(facts({ collectors: [collector('col-a', { checks: [ok('build'), ok('suite'), ok('guard'), ok('fresh')] })], pieces: [...lifecycle()] }), declaration(), flow({ lane: { active: 'col-b' } }), 'col-a');
  assert.equal(waits.verdict, 'READY');
  assert.equal(waits.next.action, 'WAIT');
  assert.equal(waits.next.status, 'waiting');
  assert.match(String(waits.next.dependency), /col-b/);

  // blocked: REVISE for the author, naming each failing owner and why
  const blocked = await pullPromotion(facts({ pieces: [...lifecycle(), promotion(20, 'col-a', { checks: [ok('build'), bad('suite'), ok('guard'), ok('fresh')] })] }), declaration(), flow(), 'col-a');
  assert.equal(blocked.verdict, 'BLOCKED');
  assert.equal(blocked.next.action, 'REVISE');
  assert.equal(blocked.next.authority, 'author');
  assert.match(blocked.next.reason, /Testing/);
  assert.match(blocked.next.reason, /suite/);

  // a hold in the declaration makes it escalate for the owner, whatever the verdict
  const held = await pullPromotion(facts({ pieces: [...lifecycle(), promotion(20, 'col-a', { checks: [ok('build'), bad('suite'), ok('guard'), ok('fresh')] })] }), declaration({ holds: [{ target: '#20', reason: 'no promotion go' }] }), flow(), 'col-a');
  assert.equal(held.verdict, 'BLOCKED', 'a hold changes the verdict');
  assert.equal(held.next.status, 'escalate');
  assert.equal(held.next.authority, 'owner');
  assert.match(held.next.reason, /no promotion go/);

  // no command, no approval, no bypass in any recommendation
  for (const r of [open, withHead, existing, waits, blocked, held]) {
    assert.ok(!/\b(gh |git |--admin|force|bypass|override|merge now|approved by)\b/i.test(JSON.stringify(r.next)), 'the recommendation reads as a command, an approval or a bypass');
  }
}
