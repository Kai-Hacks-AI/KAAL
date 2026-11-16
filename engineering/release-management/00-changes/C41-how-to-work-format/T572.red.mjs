// Case release/T572 tests: C41
import assert from 'node:assert/strict';
import { GOOD, body, load, row } from './fixtures.mjs';
export const id = 'release/T572';
export const tests = ['release/C41'];
export const title = 'step 0 is a Predecessor, the last step a Successor, the numbering is sequential, and Who is one of the five values';
export async function run() {
  const { howToWorkProblems } = await load();
  const bad = (rows, what) => assert.ok(howToWorkProblems(body(rows)).length > 0, what);
  assert.deepEqual(howToWorkProblems(body([row(0, 'Predecessor'), row(1, 'Successor')])), [], 'a table with only the border rows is rejected');
  bad(GOOD.slice(1), 'a table that does not start with a Predecessor is accepted');
  bad(GOOD.slice(0, -1), 'a table that does not end with a Successor is accepted');
  bad([row(1, 'Predecessor'), row(2, 'Worker'), row(3, 'Successor')], 'a table that does not start at step 0 is accepted');
  bad([GOOD[0], GOOD[1], row(3, 'Reviewer'), GOOD[4]], 'a gap in the numbering is accepted');
  bad([GOOD[0], GOOD[1], row(1, 'Reviewer'), row(3, 'Successor')], 'a repeated step is accepted');
  bad([GOOD[0], GOOD[1], row('two', 'Reviewer'), row(3, 'Successor')], 'a step that is not a number is accepted');
  bad([GOOD[0], row(1, 'Predecessor'), row(2, 'Successor')], 'a Predecessor in the middle is accepted');
  bad([row(0, 'Predecessor'), row(1, 'Successor'), row(2, 'Worker'), row(3, 'Successor')], 'a Successor in the middle is accepted');
  bad([GOOD[0], row(1, 'Owner'), GOOD[4].replace('4', '2')], 'a Who outside the five values is accepted');
  bad([GOOD[0], row(1, 'worker'), row(2, 'Successor')], 'a Who in other case is accepted');
}
