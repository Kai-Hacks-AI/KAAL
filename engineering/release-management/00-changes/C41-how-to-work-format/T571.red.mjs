// Case release/T571 tests: C41
import assert from 'node:assert/strict';
import { GOOD, HEADER, body, load, row } from './fixtures.mjs';
export const id = 'release/T571';
export const tests = ['release/C41'];
export const title = 'the chapter holds one table with the five columns Step, Who, Action, Status, Details and nothing else';
export async function run() {
  const { howToWorkProblems } = await load();
  const bad = (text, what) => assert.ok(howToWorkProblems(text).length > 0, what);
  bad(body(GOOD).replace('| Details |', '|'), 'a header with four columns is accepted');
  bad(body(GOOD).replace('| Status |', '| State |'), 'a renamed column is accepted');
  bad(body(GOOD).replace('| 1 | Worker | does something | open | — |', '| 1 | Worker | does something | open |'), 'a row with four cells is accepted');
  bad(body(GOOD).replace('| 1 | Worker | does something | open | — |', '| 1 | Worker | does something | open | — | extra |'), 'a row with six cells is accepted');
  bad(body(GOOD, 'Some words first.\n\n'), 'text before the table is accepted');
  bad(`${body(GOOD)}\nSome words after.\n`, 'text after the table is accepted');
  bad(`${body(GOOD)}\n${HEADER}\n${row(0, 'Predecessor')}\n${row(1, 'Successor')}\n`, 'a second table is accepted');
  bad('## Change\n\nrelease/C1 x: y\n\n## HOW TO WORK\n\n', 'an empty chapter is accepted');
}
