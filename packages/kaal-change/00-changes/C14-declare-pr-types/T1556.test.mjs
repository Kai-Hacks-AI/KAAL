// Case change/T1556 tests: change/G17
import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './T1553.test.mjs';
export const id = 'change/T1556';
export const tests = ['change/G17'];
export const closes = ['change/G17'];
export const title = 'the raise rules are the owner\'s: no Change id in a title, no draft, HOTFIX only from hotfix/* into main';
export function run() {
  for (const t of load().types) {
    assert.ok(t.raise, t.type + ' declares no raise rules');
    assert.notEqual(t.raise.draft, true, t.type + ' is drafted');
    const rules = (t.raise.title?.forbid ?? []).map(p => new RegExp(p));
    assert.ok(rules.length > 0, t.type + ' forbids nothing in a title');
    for (const s of ['C14 declare', 'change/C14 declare', 'PLAN: C14'])
      assert.ok(rules.some(r => r.test(s)), t.type + ' lets a Change id through: ' + s);
    assert.ok(!rules.some(r => r.test('Declare the four types')), t.type + ' forbids a plain title');
    if (t.type !== 'HOTFIX') assert.equal(t.raise.autoMerge, 'squash', t.type);
  }
  const h = load().types.find(t => t.type === 'HOTFIX');
  assert.deepEqual(h.raise.head, ['hotfix/*']);
  assert.deepEqual(h.raise.base, ['main']);
}
test(id, () => run());
