// Case release/T1324 tests: release/F70
import assert from 'node:assert/strict';
import { decide } from './tree-fixtures.mjs';
export const id = 'release/T1324';
export const tests = ['release/F70'];
export const title = 'the final step of a collector is decided from its tree: one retro that reflects every carried Change, well formed, and a merge that touched only the ACT folders';
export async function run() {
  const ok = await decide();
  assert.equal(ok.action, 'raise');
  assert.equal(ok.head, 'kaal/cap/small-thing');
  assert.equal(ok.base, 'main');
  assert.equal(ok.class, 'KAAL');
  // The prose of the merged pull request changes nothing: a body, a first line, chapters are not facts of the decision.
  const prose = await decide({ body: '## Change\n\nsomething else entirely\n\n## Records\n\nwhatever\n', prBody: 'x' });
  assert.deepEqual(prose, ok);
  const two = await decide({}, { changes: [{ n: 2, name: 'first-thing' }, { n: 3, name: 'second-thing' }], retros: [{ n: 1, reflects: ['cap/C2', 'cap/C3'] }] });
  assert.equal(two.action, 'raise');
}
