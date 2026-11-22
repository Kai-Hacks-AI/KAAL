// Case research/T1383 tests: research/F1
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GOOD, judged, load, problems, swap } from '../fixture.mjs';
export const id = 'research/T1383';
export const tests = ['research/F1'];
export const title = 'the finder lists rehearsal records, ignores files that are not rehearsals, refuses ones that say they are and do not fit, and a record written the way an author would is well-formed';
export async function run() {
  const { findRehearsals } = await load('find-rehearsals.mjs');
  const r = findRehearsals([{ path: 'a/RH1.md', text: GOOD }, { path: 'a/other.md', text: '# not a rehearsal\n' }, { path: 'a/RT1.md', text: '---\nid: demo/RT1\nformat: 4L\n---\n' }]);
  assert.deepEqual(r.rehearsals.map((x) => [x.id, x.verdict, x.about, x.path]), [['demo/RH1', 'favourable', 'description', 'a/RH1.md']]);
  assert.equal(r.refused.length, 0, 'a file that is not a rehearsal was refused');
  for (const [why, text] of [['id pattern', swap('id: demo/RH1', 'id: demo/R1')], ['id number', swap('id: demo/RH1', 'id: demo/RH0')], ['verdict outside the three', swap('verdict: favourable', 'verdict: works')], ['no verdict', swap('verdict: favourable\n', '')], ['no question', swap(/question: .*\n/.exec(GOOD)[0], '')]]) {
    const x = findRehearsals([{ path: 'a/RH1.md', text }]);
    assert.equal(x.rehearsals.length, 0, `${why}: listed`);
    assert.deepEqual(x.refused.map((y) => y.path), ['a/RH1.md'], `${why}: not refused`);
  }
  assert.equal(findRehearsals([]).rehearsals.length, 0);
  // Authorability: a record written for a real trial, with only the essentials and honest limits, is listed and well-formed.
  const example = readFileSync(fileURLToPath(new URL('./example/RH1.md', import.meta.url)), 'utf8');
  const found = findRehearsals([{ path: 'example/RH1.md', text: example }]);
  assert.equal(found.rehearsals.length, 1, 'the authored example is not listed');
  const held = [...example.matchAll(/path: (\S+)\n\s+sha256: (\w+)/g)].map((m) => ({ path: m[1], sha256: m[2] }));
  const ok = await judged(example, held);
  assert.equal(ok.result, 'well-formed', `the authored example is not well-formed: ${problems(ok)}`);
}
