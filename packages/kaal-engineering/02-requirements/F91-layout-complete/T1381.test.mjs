// Case engineering/T1381 tests: engineering/F91
import assert from 'node:assert/strict';
import { GOOD, fixture, judge, findings } from './fixture.mjs';
export const id = 'engineering/T1381';
export const tests = ['engineering/F91'];
export const title = 'what is too much is FAIL and named, and only that: an unnumbered folder and a root file the template does not name';
export async function run() {
  for (const extra of ['lib/x.mjs', 'plan/p.md', 'skills/s/SKILL.md', 'payload/p.md', 'test/t.mjs', 'bin/b.mjs', 'capability/c.md']) {
    const name = extra.split('/')[0];
    const r = judge(fixture([...GOOD, extra]));
    assert.equal(r.code, 1, `an unnumbered folder ${name} is not FAIL`);
    assert.deepEqual(findings(r.out), [`${name} is a folder the layout does not have`], `${name} is not the one fault named: ${r.out}`);
  }
  const file = judge(fixture([...GOOD, 'notes.txt']));
  assert.equal(file.code, 1, 'a root file the template does not name is not FAIL');
  assert.deepEqual(findings(file.out), ['notes.txt is a file the layout does not have'], `notes.txt is not the one fault named: ${file.out}`);
  assert.equal(judge(fixture([...GOOD, 'ownership.kaal.json', 'LICENSE'])).code, 0, 'a named root file is faulted');
}
