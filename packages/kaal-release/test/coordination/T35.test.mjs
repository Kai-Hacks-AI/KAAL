// Case coordination/T35 tests: F2, F5, F6 (what was not observed is shown, never guessed)
import assert from 'node:assert/strict';
import { byRef, config, piece, showWip } from './fixtures.mjs';
export const id = 'coordination/T35';
export const tests = ['coordination/F2', 'coordination/F5', 'coordination/F6'];
export const title = 'a fact that was not observed gives UNKNOWN naming it and is listed in notObserved; a known WORK cause still shows WORK; the supplier gaps are carried; nothing is defaulted';
const without = (n, key, over = {}) => { const p = piece(n, over); delete p[key]; return p; };
export async function run() {
  const report = await showWip({
    pieces: [without(1, 'review'), without(2, 'threads'), without(3, 'checks'), without(4, 'fit'), without(5, 'landing'), without(6, 'landing', { review: 'none' }), without(7, 'review', { draft: true }), without(8, 'threads', { checks: 'failure' })],
    gaps: ['more pieces than were read (20): the rest are not read'],
  }, config());
  for (const [ref, fact] of [['#1', /review/], ['#2', /thread/], ['#3', /check/], ['#4', /fit|conflict|up to date/i], ['#5', /landing/]]) {
    const got = byRef(report, ref);
    assert.equal(got.disposition, 'UNKNOWN', `${ref} was guessed: ${got.disposition}`);
    assert.match(got.reason, fact, `${ref}: the missing fact is not named`);
    assert.ok(report.notObserved.some((n) => n.includes(ref) && fact.test(n)), `${ref}: not listed in notObserved`);
  }
  assert.equal(byRef(report, '#6').disposition, 'REVIEW', 'an unknown landing hides a piece that only needs a review');
  assert.equal(byRef(report, '#7').disposition, 'WORK', 'a known WORK cause is hidden by an unknown fact');
  assert.equal(byRef(report, '#8').disposition, 'WORK');
  assert.ok(report.notObserved.includes('more pieces than were read (20): the rest are not read'), 'a supplier gap is not carried');
  assert.ok(!report.notObserved.some((n) => /#6|#7|#8/.test(n)), 'a piece whose disposition is known is listed as not observed');
}
