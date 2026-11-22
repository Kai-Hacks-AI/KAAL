// Case research/T1383 tests: research/F1
import assert from 'node:assert/strict';
import { GOOD, load, swap } from '../fixture.mjs';
export const id = 'research/T1383';
export const tests = ['research/F1'];
export const title = 'the finder lists rehearsal records with id, verdict and question, ignores files that are not rehearsals, refuses ones that say they are and do not fit, and searches no folder';
export async function run() {
  const { findRehearsals } = await load('find-rehearsals.mjs');
  const r = findRehearsals([{ path: 'a/RH1.md', text: GOOD }, { path: 'a/other.md', text: '# not a rehearsal\n' }, { path: 'a/RT1.md', text: '---\nid: demo/RT1\nformat: 4L\n---\n' }]);
  assert.deepEqual(r.rehearsals.map((x) => [x.id, x.verdict, x.path]), [['demo/RH1', 'inconclusive', 'a/RH1.md']]);
  assert.equal(r.refused.length, 0, 'a file that is not a rehearsal was refused');
  for (const [why, text] of [['id pattern', swap('id: demo/RH1', 'id: demo/R1')], ['id number', swap('id: demo/RH1', 'id: demo/RH0')], ['verdict outside the three', swap('verdict: inconclusive', 'verdict: works')], ['no verdict', swap('verdict: inconclusive\n', '')], ['no question', swap(/question: .*\n/.exec(GOOD)[0], '')]]) {
    const x = findRehearsals([{ path: 'a/RH1.md', text }]);
    assert.equal(x.rehearsals.length, 0, `${why}: listed`);
    assert.deepEqual(x.refused.map((y) => y.path), ['a/RH1.md'], `${why}: not refused`);
  }
  assert.equal(findRehearsals([]).rehearsals.length, 0);
}
