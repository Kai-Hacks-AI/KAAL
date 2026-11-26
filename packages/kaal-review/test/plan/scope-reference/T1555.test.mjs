// Case review/T1555 tests: review/F37. What the scope is compared against is its reference, and every item has one, outside or intrinsic.
import assert from 'node:assert/strict';
import { item, kinds, load, tree } from './lib.mjs';
export const id = 'review/T1555';
export const tests = ['review/F37'];
export const title = 'the references of an item are listed and the items are found by a reference of any kind and by intrinsic, an item with an intrinsic reference is valid, an item with no reference or an empty one is not valid and says so, and a malformed reference is a named finding while the item stays listed';
export async function run() {
  const { navigate } = await load();
  const root = tree({
    'v/V1.md': item('ns/V1', { validates: ['path:src/'], against: ['x/F1'] }),
    'v/V2.md': item('ns/V2', { validates: ['x/A1'], against: ['x/F1', 'x/I1', 'path:docs/spec.md'] }),
    'v/V3.md': item('ns/V3', { validates: ['path:docs/guide.md'], against: ['intrinsic'] }),
    'v/V4.md': item('ns/V4', { validates: ['x/F1'], against: ['x/F1'] }),
  });
  const n = await navigate(root, {});
  assert.deepEqual(kinds(n), [], 'a sound tree has no finding');
  const by = Object.fromEntries(n.items.map((i) => [i.id, i]));
  assert.deepEqual(by['ns/V1'].against, ['x/F1']);
  assert.deepEqual(by['ns/V2'].against, ['x/F1', 'x/I1', 'path:docs/spec.md'], 'a reference may be of any kind and a path');
  assert.deepEqual(by['ns/V3'].against, ['intrinsic'], 'an intrinsic reference is written and listed');
  assert.ok(n.judgedAgainst && typeof n.judgedAgainst === 'object', 'the answer carries the items by reference');
  assert.deepEqual(n.judgedAgainst['x/F1'], ['ns/V1', 'ns/V2', 'ns/V4'], 'the items judged against a Requirement, in order');
  assert.deepEqual(n.judgedAgainst['x/I1'], ['ns/V2']);
  assert.deepEqual(n.judgedAgainst['path:docs/spec.md'], ['ns/V2']);
  assert.deepEqual(n.judgedAgainst.intrinsic, ['ns/V3'], 'the items that are compared only against themselves are found');
  assert.equal(Object.hasOwn(n.judgedAgainst, 'x/A1'), false, 'what is only examined is not a reference');
  assert.deepEqual(n.validatedBy['x/F1'], ['ns/V4'], 'the scope side is unchanged by the reference side');

  const missing = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/F1'], against: undefined }),
    'v/V2.md': item('ns/V2', { validates: ['x/F1'], against: [] }),
    'v/V3.md': item('ns/V3', { validates: ['x/F1'], against: ['intrinsic'] }),
  });
  const m = await navigate(missing, {});
  assert.deepEqual(m.items.map((i) => i.id), ['ns/V3'], 'an item without a reference is not valid and not listed, one with an intrinsic reference is');
  assert.deepEqual(kinds(m), ['item-incomplete', 'item-incomplete']);
  assert.deepEqual(m.findings.map((f) => f.missing), [['reference'], ['reference']], 'the finding says the reference is missing, and nothing else');

  const proto = tree({ 'v/V1.md': item('ns/V1', { validates: ['x/F1'], against: ['__proto__', 'constructor'] }) });
  const p = await navigate(proto, {});
  assert.deepEqual(p.judgedAgainst['__proto__'], ['ns/V1'], 'a reference named like a prototype key is an ordinary reference');
  assert.equal(Object.getPrototypeOf(p.judgedAgainst), Object.prototype);

  const bad = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/F1'], against: ['path:'] }),
    'v/V2.md': item('ns/V2', { validates: ['x/F1'], against: ['path:a/../b'] }),
    'v/V3.md': item('ns/V3', { validates: ['x/F1'], against: ['x/F2'] }),
  });
  const b = await navigate(bad, {});
  assert.deepEqual(kinds(b), ['bad-against-reference', 'bad-against-reference'], 'a malformed reference is a named finding');
  assert.deepEqual(b.items.map((i) => i.id), ['ns/V1', 'ns/V2', 'ns/V3'], 'an item with a malformed reference stays listed');
  assert.deepEqual(b.judgedAgainst['x/F2'], ['ns/V3']);
  assert.equal(Object.hasOwn(b.judgedAgainst, 'path:'), false, 'a malformed reference is not a key');
}
