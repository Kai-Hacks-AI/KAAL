// Case review/T1555 tests: review/F37. What an item is judged against is its reference, and the items are found by it.
import assert from 'node:assert/strict';
import { item, kinds, load, tree } from './lib.mjs';
export const id = 'review/T1555';
export const tests = ['review/F37'];
export const title = 'the references of an item are listed and the items are found by a reference of any kind, an item with Criteria and no reference is valid, an item with a reference and no Criteria and an item with neither are not valid, and an empty or malformed reference is a named finding while the item stays listed';
export async function run() {
  const { navigate } = await load();
  const root = tree({
    'v/V1.md': item('ns/V1', { validates: ['path:src/'], against: ['x/F1'] }),
    'v/V2.md': item('ns/V2', { validates: ['x/A1'], against: ['x/F1', 'x/I1', 'path:docs/spec.md'] }),
    'v/V3.md': item('ns/V3', { validates: ['x/D1'] }),
    'v/V4.md': item('ns/V4', { validates: ['x/F1'], against: ['x/F1'] }),
  });
  const n = await navigate(root, {});
  assert.deepEqual(kinds(n), [], 'a sound tree has no finding, an item without a reference included');
  const by = Object.fromEntries(n.items.map((i) => [i.id, i]));
  assert.deepEqual(by['ns/V1'].against, ['x/F1']);
  assert.deepEqual(by['ns/V2'].against, ['x/F1', 'x/I1', 'path:docs/spec.md'], 'a reference may be of any kind and a path');
  assert.deepEqual(by['ns/V3'].against, [], 'an item without a reference has none');
  assert.ok(n.judgedAgainst && typeof n.judgedAgainst === 'object', 'the answer carries the items by reference');
  assert.deepEqual(n.judgedAgainst['x/F1'], ['ns/V1', 'ns/V2', 'ns/V4'], 'the items judged against a Requirement, in order');
  assert.deepEqual(n.judgedAgainst['x/I1'], ['ns/V2']);
  assert.deepEqual(n.judgedAgainst['path:docs/spec.md'], ['ns/V2']);
  assert.equal(Object.hasOwn(n.judgedAgainst, 'x/A1'), false, 'what is only examined is not a reference');
  assert.equal(Object.hasOwn(n.judgedAgainst, 'ns/V3'), false);
  assert.deepEqual(n.validatedBy['x/F1'], ['ns/V4'], 'the scope side is unchanged by the reference side');

  const thin = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/F1'], against: ['x/I1'], criteria: undefined }),
    'v/V2.md': item('ns/V2', { validates: ['x/F1'], criteria: undefined }),
    'v/V3.md': item('ns/V3', { validates: ['x/F1'], against: [], criteria: [] }),
    'v/V4.md': item('ns/V4', { validates: ['x/F1'] }),
  });
  const t = await navigate(thin, {});
  assert.deepEqual(t.items.map((i) => i.id), ['ns/V4'], 'only the item with Criteria is valid: an external reference does not replace criteria, and neither alone is not a review');
  assert.deepEqual(kinds(t), ['item-incomplete', 'item-incomplete', 'item-incomplete'], 'each item without Criteria is named, with or without a reference');
  assert.ok(t.findings.every((f) => /reference|Criteria/.test(f.detail)), 'the finding says what the item lacks');
  assert.equal(Object.hasOwn(t.judgedAgainst, 'x/I1'), false, 'an item that is not valid is not found by its reference');

  const proto = tree({ 'v/V1.md': item('ns/V1', { validates: ['x/F1'], against: ['__proto__', 'constructor'] }) });
  const p = await navigate(proto, {});
  assert.deepEqual(p.judgedAgainst['__proto__'], ['ns/V1'], 'a reference named like a prototype key is an ordinary reference');
  assert.equal(Object.getPrototypeOf(p.judgedAgainst), Object.prototype);

  const bad = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/F1'], against: ['path:'] }),
    'v/V2.md': item('ns/V2', { validates: ['x/F1'], against: ['path:a/../b'] }),
    'v/V3.md': item('ns/V3', { validates: ['x/F1'], against: [] }),
    'v/V4.md': item('ns/V4', { validates: ['x/F1'], against: ['x/F2'] }),
  });
  const b = await navigate(bad, {});
  assert.deepEqual(kinds(b), ['bad-against-reference', 'bad-against-reference'], 'a malformed reference is a named finding, an empty list is not');
  assert.deepEqual(b.items.map((i) => i.id), ['ns/V1', 'ns/V2', 'ns/V3', 'ns/V4'], 'an item with a malformed reference stays listed');
  assert.deepEqual(b.judgedAgainst['x/F2'], ['ns/V4']);
  assert.equal(Object.hasOwn(b.judgedAgainst, 'path:'), false, 'a malformed reference is not a key');
}
