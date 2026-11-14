// Case coordination/T43 tests: F15 (the rendered review sequence)
import assert from 'node:assert/strict';
import { config, render, showWip, typed } from './review-fixtures.mjs';
export const id = 'coordination/T43';
export const tests = ['coordination/F15'];
export const title = 'the rendering shows a Review sequence section with a numbered line per entry, the head, CLEAN or NOT CLEAN with reasons, @unknown for an unobserved head, and a sentence when nothing waits';
export async function run() {
  const { head, ...noHead } = typed(3, 'DO', { into: 'col/b' });
  const pieces = [typed(9, 'PROMOTION', { from: 'col/a', into: 'target' }), typed(4, 'SYNC', { from: 'target', into: 'col/a' }), noHead];
  const text = await render(await showWip({ pieces }, config()));
  assert.match(text, /Review sequence/);
  assert.match(text, /^1\. #9 +PROMOTION +col\/a → target +@abcdef9 +NOT CLEAN.*#4/m, 'the first line is not rank, ref, type, from → into, head, NOT CLEAN with the sync');
  assert.match(text, /^2\. #4 +SYNC +target → col\/a +@abcdef4 +CLEAN/m);
  assert.match(text, /^3\. #3 +DO +work-3 → col\/b +@unknown +UNKNOWN.*head/m, 'an unobserved head is not shown as @unknown and UNKNOWN');
  assert.ok(text.indexOf('Review sequence') > text.indexOf('Integration'), 'the sequence does not follow the board');

  const none = await render(await showWip({ pieces: [typed(1, 'DO', { review: 'approved' })] }, config()));
  assert.match(none, /Review sequence[\s\S]*(nothing|no piece)/i, 'an empty sequence is not said');
}
