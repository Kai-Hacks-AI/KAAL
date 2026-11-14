// Case coordination/T40 tests: F11 (the review sequence)
import assert from 'node:assert/strict';
import { config, showWip, typed } from './review-fixtures.mjs';
export const id = 'coordination/T40';
export const tests = ['coordination/F11'];
export const title = 'the review sequence lists only REVIEW pieces, ranked from 1, by station order, then type order, then reference, and does not depend on the input order';
export async function run() {
  const pieces = [
    typed(5, 'PLAN', { into: 'col/a' }),
    typed(4, 'SYNC', { from: 'target', into: 'col/b' }),
    typed(9, 'PROMOTION', { from: 'col/a', into: 'target' }),
    typed(3, 'DO', { into: 'col/a' }),
    typed(7, 'DO', { draft: true }),
    typed(8, 'DO', { review: 'approved' }),
  ];
  const report = await showWip({ pieces }, config());
  assert.ok(Array.isArray(report.review), 'the report has no review sequence');
  assert.deepEqual(report.review.map((r) => r.ref), ['#9', '#4', '#3', '#5'], 'the sequence is not station, then type, then reference');
  assert.deepEqual(report.review.map((r) => r.rank), [1, 2, 3, 4]);
  assert.ok(!report.review.some((r) => r.ref === '#7' || r.ref === '#8'), 'a piece that is not REVIEW is in the sequence');

  const shuffled = await showWip({ pieces: [...pieces].reverse() }, config());
  assert.deepEqual(shuffled.review, report.review, 'the sequence depends on the input order');

  const unlisted = await showWip({ pieces: [typed(2, 'ACT', { into: 'col/a' }), typed(1, 'DO', { into: 'col/a' })] }, config());
  assert.deepEqual(unlisted.review.map((r) => r.ref), ['#1', '#2'], 'an unlisted type does not follow the listed ones');

  const plain = config(); delete plain.review;
  const fallback = await showWip({ pieces: [typed(2, 'DO', { from: 'x', into: 'target' }), typed(1, 'DO', { into: 'col/a' }), typed(3, 'DO', { into: 'col/a' })] }, plain);
  assert.deepEqual(fallback.review.map((r) => r.ref), ['#1', '#3', '#2'], 'without a review key the order is not station order, then reference');
}
