// Case engineering/T1380 tests: engineering/F91
import assert from 'node:assert/strict';
import { GOOD, fixture, judge, without, findings } from './fixture.mjs';
export const id = 'engineering/T1380';
export const tests = ['engineering/F91'];
export const title = 'what is missing is FAIL and named, and only that; a folder with every required part and none of the optional ones is PASS';
export async function run() {
  assert.equal(judge(fixture(GOOD)).code, 0, 'a folder with every required part is not PASS');
  for (const m of ['AGENTS.md', 'README.md', 'package.json', '10-intent', '11-requirements', '12-architecture', '13-source', '14-operations']) {
    const r = judge(fixture(without(m)));
    assert.equal(r.code, 1, `a folder without ${m} is not FAIL`);
    assert.ok(findings(r.out).some((f) => f.startsWith(m) && /missing/.test(f)), `${m} is not named as missing: ${r.out}`);
  }
  const optional = judge(fixture([...GOOD, '00-backlog/b.md', '01-changes/c.md', '02-learnings/retros/RT1.md', '15-defects/defects/D1.md', '15-defects/test-cases/T4.test.mjs', 'x.kaal.json']));
  assert.equal(optional.code, 0, `an optional part is faulted: ${optional.out}`);
}
