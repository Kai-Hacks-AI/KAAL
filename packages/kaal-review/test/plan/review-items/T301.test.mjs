// Case review/T301 tests: review/F30. A result applies to its revision; nothing carries silently.
import assert from 'node:assert/strict';
import { item, kinds, load, result, tree } from './lib.mjs';
export const id = 'review/T301';
export const tests = ['review/F30'];
export const title = 'a result applies to the revision it names, reaches another only by a carry-forward that states its reason, and is otherwise stale';
const A = 'a'.repeat(40);
const B = 'b'.repeat(40);
const C = 'c'.repeat(40);
const f = (revision, conclusion, extra = {}) => ({ appraises: 'ns/V1', revision, appraiser: 'an Agent', relation: 'not-author', execution: 'performed', conclusion, ...extra });
export async function run() {
  const navigate = await load();
  const root = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/F1'] }),
    'r/RV1.md': result('ns/RV1', f(A, 'satisfied')),
    'r/RV2.md': result('ns/RV2', f(B, 'satisfied', { carries: 'ns/RV1' }), { result: 'Carried: the later commit does not touch the subject or the evidence.' }),
  });
  const at = async (rev) => (await navigate(root, { revision: rev }));
  assert.deepEqual((await at(A)).current['ns/V1'], [{ result: 'ns/RV1', applicability: 'applies' }]);
  assert.deepEqual((await at(B)).current['ns/V1'], [{ result: 'ns/RV2', applicability: 'applies' }, { result: 'ns/RV1', applicability: 'carried' }], 'at B the carry-forward applies and the result it carries is carried');
  const c = await at(C);
  assert.deepEqual(c.current['ns/V1'], [], 'at C nothing applies, and nothing is carried silently');
  assert.deepEqual(c.stale['ns/V1'].sort(), ['ns/RV1', 'ns/RV2']);

  const bad = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/F1'] }),
    'r/RV1.md': result('ns/RV1', f(A, 'satisfied')),
    'r/RV2.md': result('ns/RV2', f(B, 'satisfied', { carries: 'ns/RV1' }), { result: undefined }),
    'r/RV3.md': result('ns/RV3', f(C, 'satisfied', { carries: 'ns/RV99' }), { result: 'Carried.' }),
    'r/RV4.md': result('ns/RV4', f(C, 'not-satisfied', { carries: 'ns/RV1' }), { result: 'Carried.' }),
  });
  assert.deepEqual(kinds(await navigate(bad, { revision: C })), ['carry-conclusion-differs', 'carry-dangling', 'carry-without-reason']);
}
