// Case pull/T19 tests: pull/F21
import assert from 'node:assert/strict';
import { collector, declaration, facts, green, lifecycle, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T19';
export const tests = ['pull/F21'];
export const title = 'the Script walks the declared collectors in the declared order, once each; a declared collector the host lacks is not judged, a host collector the declaration does not list is reported undeclared and not judged, and the result does not depend on the order of the input';
export async function run() {
  const decl = declaration({ collectors: [{ name: 'col-b' }, { name: 'col-a' }, { name: 'col-c' }] });
  const input = facts({
    collectors: [collector('col-a'), collector('col-b'), collector('col-x', green())],
    pieces: [...lifecycle('col-a'), ...lifecycle('col-b', undefined, 20)],
  });
  const result = await walkCollectors(input, decl);
  assert.deepEqual(result.collectors.map((c) => c.name), ['col-b', 'col-a', 'col-c'], 'the entries are not one per declared collector, in the declared order');

  const lacking = result.collectors.find((c) => c.name === 'col-c');
  assert.equal(lacking.status, 'not judged', 'a declared collector the host does not have was judged');
  assert.ok(lacking.missing.some((m) => /collector/i.test(m)), 'the missing collector is not named');

  assert.deepEqual(result.undeclared, ['col-x'], 'a host collector the declaration does not list is not reported undeclared');
  assert.ok(!result.collectors.some((c) => c.name === 'col-x'), 'an undeclared collector was judged');

  // the same facts in another order give the same bytes
  const shuffled = facts({ ...input, collectors: [...input.collectors].reverse(), pieces: [...input.pieces].reverse() });
  assert.equal(JSON.stringify(await walkCollectors(shuffled, decl)), JSON.stringify(result), 'the result depends on the order of the input');

  // a declaration that lists no collectors cannot be walked: it says so and judges nothing
  const none = await walkCollectors(input, declaration({ collectors: undefined }));
  assert.deepEqual(none.collectors, []);
  assert.ok(none.problems.some((p) => /collectors/i.test(p)), 'an empty declaration is not reported');
}
