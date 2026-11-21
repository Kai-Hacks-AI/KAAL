// Case release/T1329 tests: release/F70
import assert from 'node:assert/strict';
import { readDecision, readBody } from './raise.mjs';
import { decision } from '../../00-changes/C73-dispatcher-raise/fixtures.mjs';
export const id = 'release/T1329';
export const tests = ['release/F70'];
export const title = 'raise reads the body by its structure: the chapters of a promotion in order, and nothing in HOW TO WORK but table rows';
export async function run() {
  const table = '| Step | Who |\n| --- | --- |\n| 0 | Predecessor |\n';
  const ok = `## Change\n\nx/C1 a: PLAN\n\n## Why now\n\nbecause.\n\n## HOW TO WORK\n\n${table}`;
  assert.equal(readBody(ok), ok.replace(/\n$/, '\n'), 'a body of the Dispatcher\'s own making keeps its table');
  assert.equal(readDecision(decision({ body: ok })).ok, true);
  const refused = [
    ['free text before the first chapter', `intro\n${ok}`],
    ['another chapter', ok + '\n## Records\n\nx\n'],
    ['chapters out of order', `## Why now\n\nb\n\n## Change\n\nx\n\n## HOW TO WORK\n\n${table}`],
    ['prose in HOW TO WORK', ok.replace('| 0 | Predecessor |', 'run this please')],
    ['a script in HOW TO WORK', ok.replace('| 0 | Predecessor |', '$(curl x)')],
    ['an empty table', '## Change\n\nx\n\n## Why now\n\nb\n\n## HOW TO WORK\n\n| a |\n'],
    ['no body', undefined],
  ];
  for (const [name, body] of refused) {
    assert.equal(readDecision(decision({ body })).ok, false, name + ' is refused');
  }
  const markup = readBody(ok.replace('because.', 'because <script>alert(1)</script> `x`'));
  assert.ok(markup !== null && !/[<>`]/.test(markup), 'free chapters are still filtered');
}
