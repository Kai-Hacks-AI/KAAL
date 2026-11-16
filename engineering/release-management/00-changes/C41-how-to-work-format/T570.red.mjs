// Case release/T570 tests: C41
import assert from 'node:assert/strict';
import { GOOD, body, load } from './fixtures.mjs';
export const id = 'release/T570';
export const tests = ['release/C41'];
export const title = 'a well-formed HOW TO WORK table gives no finding, a body without the chapter gives none, and a bad table gives some';
export async function run() {
  const { howToWorkProblems } = await load();
  assert.equal(typeof howToWorkProblems, 'function', 'howToWorkProblems is not exported');
  assert.deepEqual(howToWorkProblems(body(GOOD)), [], 'a well-formed table is rejected');
  assert.deepEqual(howToWorkProblems('## Change\n\nrelease/C1 x: y\n'), [], 'a body without the chapter is judged');
  assert.deepEqual(howToWorkProblems(body(GOOD).replace('Predecessor', 'Nobody')).length > 0, true, 'a bad table gives no finding');
}
