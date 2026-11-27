// Case review/T1556 tests: review/F38. Criteria are the dimensions of judgement: required, and never the reference.
import assert from 'node:assert/strict';
import { item, kinds, load, tree } from './lib.mjs';
export const id = 'review/T1556';
export const tests = ['review/F38'];
export const title = 'an item with a reference and criteria is valid, an item with criteria and no reference and an item with a reference and no criteria are each not valid and say which is missing, and a criterion that is word for word an entry of the reference or the scope is a named finding while the item stays listed';
export async function run() {
  const { navigate } = await load();
  const root = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/A1'], against: ['x/F1'], criteria: ['it is complete', 'it is free of overlap'] }),
    'v/V2.md': item('ns/V2', { validates: ['path:docs/guide.md'], against: ['intrinsic'], criteria: ['its own definitions agree'] }),
  });
  const ok = await navigate(root, {});
  assert.deepEqual(kinds(ok), [], 'a reference with criteria is valid, an intrinsic reference included');
  assert.deepEqual(ok.items.map((i) => i.criteria), [['it is complete', 'it is free of overlap'], ['its own definitions agree']], 'the criteria are listed as written');

  const thin = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/A1'], against: ['x/F1'], criteria: undefined }),
    'v/V2.md': item('ns/V2', { validates: ['x/A1'], against: ['x/F1'], criteria: [] }),
    'v/V3.md': item('ns/V3', { validates: ['x/A1'], against: undefined, criteria: ['it is complete'] }),
    'v/V4.md': item('ns/V4', { validates: ['x/A1'], against: undefined, criteria: undefined }),
  });
  const t = await navigate(thin, {});
  assert.deepEqual(t.items, [], 'criteria do not replace a reference and a reference does not replace criteria');
  assert.deepEqual(kinds(t), ['item-incomplete', 'item-incomplete', 'item-incomplete', 'item-incomplete']);
  const missing = (file) => t.findings.find((f) => f.files[0].endsWith(file)).missing;
  assert.deepEqual(missing('V1.md'), ['criteria'], 'a missing Criteria chapter is said');
  assert.deepEqual(missing('V2.md'), ['criteria'], 'an empty Criteria chapter is said');
  assert.deepEqual(missing('V3.md'), ['reference'], 'a missing reference is said');
  assert.deepEqual(missing('V4.md'), ['reference', 'criteria'], 'neither is not valid, and both are said');

  const overlap = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/A1'], against: ['x/F1'], criteria: ['x/F1'] }),
    'v/V2.md': item('ns/V2', { validates: ['x/A1'], against: ['x/F1'], criteria: ['x/A1', 'it is complete'] }),
    'v/V3.md': item('ns/V3', { validates: ['x/A1'], against: ['x/F1'], criteria: ['it satisfies x/F1'] }),
    'v/V4.md': item('ns/V4', { validates: ['path:docs/guide.md'], against: ['path:docs/spec.md'], criteria: ['path:docs/spec.md'] }),
  });
  const o = await navigate(overlap, {});
  assert.deepEqual(kinds(o), ['criterion-restates-reference', 'criterion-restates-reference', 'criterion-restates-reference'], 'a criterion that is word for word a reference or a scope entry is named; a criterion that only mentions one is the appraiser\'s judgement');
  assert.deepEqual(o.items.map((i) => i.id), ['ns/V1', 'ns/V2', 'ns/V3', 'ns/V4'], 'an item with a restating criterion stays listed');
}
