// Case pull/T25 tests: pull/F22
import assert from 'node:assert/strict';
import { collector, declaration, facts, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T25';
export const tests = ['pull/F22'];
export const title = 'an absent or empty lifecycle or Check declaration is not a vacuous success: every collector is not judged, naming the missing declaration, and nothing qualifies';
export async function run() {
  const cases = [
    ['no lifecycle', { lifecycle: undefined }, /lifecycle/],
    ['empty lifecycle', { lifecycle: [] }, /lifecycle/],
    ['no checks', { checks: undefined }, /checks/],
    ['empty checks', { checks: [] }, /checks/],
    ['both empty', { lifecycle: [], checks: [] }, /lifecycle/],
  ];
  for (const [label, over, named] of cases) {
    const result = await walkCollectors(facts(), declaration(over));
    assert.deepEqual(result.qualifiers, [], `${label}: a collector qualified on a vacuous declaration`);
    assert.equal(result.next.collector, null, `${label}: a collector is named as next`);
    assert.ok(result.problems.some((p) => named.test(p)), `${label}: the missing declaration is not reported`);
    for (const name of ['col-a', 'col-b', 'col-c']) {
      const entry = statusOf(result, name);
      assert.equal(entry.status, 'not judged', `${label}: ${name} is ${entry.status}`);
      assert.ok(entry.missing.some((m) => named.test(m)), `${label}: ${name} does not name the missing declaration`);
    }
  }
  // a failing collector is still not judged when the declaration is missing: no verdict without a declared standard
  const red = await walkCollectors(facts({ collectors: [collector('col-a', []), collector('col-b'), collector('col-c')] }), declaration({ checks: [] }));
  assert.equal(statusOf(red, 'col-a').status, 'not judged');
}
