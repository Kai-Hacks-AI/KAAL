// Case coordination/T41 tests: F12 (clean for review)
import assert from 'node:assert/strict';
import { config, showWip, typed } from './review-fixtures.mjs';
export const id = 'coordination/T41';
export const tests = ['coordination/F12'];
export const title = 'a REVIEW piece is clean when its checks passed, no sync is ahead and its head was observed; silent checks make it not clean with a reason; an unobserved head makes it unknown, never clean';
const entry = async (piece) => (await showWip({ pieces: [piece] }, config())).review?.find((r) => r.ref === piece.ref);
export async function run() {
  const clean = await entry(typed(1, 'DO'));
  assert.ok(clean, 'a REVIEW piece has no entry');
  assert.equal(clean.clean, true);
  assert.deepEqual(clean.reasons, []);
  assert.equal(clean.head, 'abcdef1000');

  const silent = await entry(typed(2, 'DO', { checks: 'none' }));
  assert.equal(silent.clean, false, 'silent checks are clean');
  assert.match(silent.reasons.join(' '), /checks?.*(no|nothing|none)/i);

  const { head, ...noHead } = typed(3, 'DO');
  const blind = await entry(noHead);
  assert.equal(blind.clean, 'unknown', 'an unobserved head is told as clean');
  assert.match(blind.reasons.join(' '), /head/i);

  const report = await showWip({ pieces: [typed(4, 'DO', { review: 'approved' }), typed(5, 'DO', { draft: true })] }, config());
  assert.deepEqual(report.review, [], 'a piece that is not REVIEW has an entry');
}
