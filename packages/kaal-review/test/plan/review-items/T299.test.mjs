// Case review/T299 tests: review/F28. The validation pointer and the three reverse questions.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { PACKAGE, item, keys, load, result, tree } from './lib.mjs';
export const id = 'review/T299';
export const tests = ['review/F28'];
export const title = 'who validates a subject, which items have no applying result and which results apply to a revision are answered from the tree alone, and no answer states coverage';
const REV_A = 'a'.repeat(40);
const REV_B = 'b'.repeat(40);
const rec = (n, appraises, revision, conclusion) => result(`ns/RV${n}`, { appraises, revision, appraiser: 'an Agent', relation: 'not-author', execution: 'performed', conclusion });
export async function run() {
  const navigate = await load();
  const root = tree({
    'one/V1.md': item('ns/V1', { validates: ['x/F2', 'x/I1'] }),
    'two/review-items/V2.md': item('ns/V2', { validates: ['x/F2'] }),
    'three/V3.md': item('ns/V3', { validates: ['path:AGENTS.md'] }),
    'learn/RV1.md': rec(1, 'ns/V1', REV_A, 'satisfied'),
    'learn/RV2.md': rec(2, 'ns/V2', REV_B, 'not-satisfied'),
  });
  const nav = await navigate(root, { revision: REV_B });
  assert.deepEqual(nav.validatedBy['x/F2'], ['ns/V1', 'ns/V2'], 'who validates x/F2: both items, in number order');
  assert.deepEqual(nav.validatedBy['path:AGENTS.md'], ['ns/V3']);
  assert.deepEqual(nav.validatedBy['x/Unknown'] ?? [], [], 'a subject with no item is answered with an empty list');
  const without = nav.items.filter((i) => (nav.current[i.id] ?? []).length === 0).map((i) => i.id);
  assert.deepEqual(without, ['ns/V1', 'ns/V3'], 'which items have no result that applies to revision B: V1 has only a result for A, V3 has none');
  const applying = Object.values(nav.current).flat().map((c) => c.result);
  assert.deepEqual(applying, ['ns/RV2'], 'which results apply to revision B');
  assert.deepEqual(nav.stale['ns/V1'], ['ns/RV1'], 'a result for another revision is listed apart and never applied');
  const bad = [...keys(nav)].filter((k) => /^(covered|coverage|satisfied|sufficient|verdict|score|ok|passed)$/i.test(k));
  assert.deepEqual(bad, [], 'no answer carries a verdict about coverage');
  const none = await navigate(root);
  assert.deepEqual(none.current, {}, 'with no revision stated nothing is said to apply');

  // The worked examples of the PLAN, the history of controls/C21: from a subject to its items and the results that apply at each revision.
  const ex = await navigate(join(PACKAGE, '00-changes/C5-review-items/examples'), { revision: '36766a0f4df6c2fdaef37b871f0273ec0b49f1ed' });
  assert.deepEqual(ex.findings, [], 'the worked examples are well-formed');
  assert.deepEqual(ex.validatedBy['controls/F34'], ['example/V1', 'example/V2'], 'who validates controls/F34');
  assert.deepEqual(ex.current['example/V1'], [{ result: 'example/RV2', applicability: 'applies' }, { result: 'example/RV1', applicability: 'carried' }], 'the first appraisal of J1 is carried to the later revision, with its reason');
  assert.deepEqual(ex.current['example/V2'], [{ result: 'example/RV4', applicability: 'applies' }]);
  assert.deepEqual(ex.stale['example/V2'], ['example/RV3'], 'the earlier, unresolved appraisal of J3 is stale at the later revision');
  const earlier = await navigate(join(PACKAGE, '00-changes/C5-review-items/examples'), { revision: '68230a6f2d17e0026735ca49463ad1a8fab3df49' });
  assert.equal(earlier.results.find((r) => r.id === 'example/RV3').conclusion, 'unresolved');
  assert.deepEqual(earlier.current['example/V2'], [{ result: 'example/RV3', applicability: 'applies' }]);
}
