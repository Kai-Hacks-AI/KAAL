// Case review/T300 tests: review/F29, review/F30. Execution apart from result, and the conclusions.
import assert from 'node:assert/strict';
import { item, kinds, load, result, tree } from './lib.mjs';
export const id = 'review/T300';
export const tests = ['review/F29', 'review/F30'];
export const title = 'satisfied, not-satisfied and unresolved are told apart from an assessment that could not be performed and from one that never ran, and an incoherent record is a named finding';
const REV = 'c'.repeat(40);
const base = (n, conclusion, extra = {}) => ({ appraises: `ns/V${n}`, revision: REV, appraiser: 'an Agent', relation: 'not-author', execution: 'performed', conclusion, ...extra });
export async function run() {
  const navigate = await load();
  const root = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/F1'] }), 'v/V2.md': item('ns/V2', { validates: ['x/F1'] }), 'v/V3.md': item('ns/V3', { validates: ['x/F1'] }),
    'v/V4.md': item('ns/V4', { validates: ['x/F1'] }), 'v/V5.md': item('ns/V5', { validates: ['x/F1'] }),
    'r/RV1.md': result('ns/RV1', base(1, 'satisfied')),
    'r/RV2.md': result('ns/RV2', base(2, 'not-satisfied')),
    'r/RV3.md': result('ns/RV3', base(3, 'unresolved'), { result: 'The evidence is missing: the trial was not run.' }),
    'r/RV4.md': result('ns/RV4', base(4, undefined, { execution: 'could-not-perform', reason: 'the tool failed' }), { result: undefined }),
  });
  const nav = await navigate(root, { revision: REV });
  const by = Object.fromEntries(nav.results.map((r) => [r.id, r]));
  assert.deepEqual(['ns/RV1', 'ns/RV2', 'ns/RV3'].map((i) => by[i].conclusion), ['satisfied', 'not-satisfied', 'unresolved']);
  assert.equal(by['ns/RV4'].conclusion, null, 'an assessment that could not be performed has no conclusion');
  assert.equal(by['ns/RV4'].execution, 'could-not-perform');
  assert.deepEqual(nav.current['ns/V5'], [], 'an assessment that never ran has no record at all');
  assert.notEqual(by['ns/RV3'].conclusion, by['ns/RV4'].conclusion, 'unresolved and could-not-perform are not the same');
  assert.deepEqual(nav.findings, [], 'a coherent tree has no finding');

  const bad = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/F1'] }),
    'r/RV1.md': result('ns/RV1', base(1, undefined)),
    'r/RV2.md': result('ns/RV2', base(1, 'satisfied', { execution: 'could-not-perform' }), { result: undefined }),
    'r/RV3.md': result('ns/RV3', base(1, 'approved')),
    'r/RV4.md': result('ns/RV4', base(1, 'satisfied', { parts: ['the documents: satisfied', 'an agent applies it: unresolved'] })),
    'r/RV5.md': result('ns/RV5', base(9, 'satisfied')),
  });
  assert.deepEqual(kinds(await navigate(bad, { revision: REV })), [
    'bad-conclusion', 'conclusion-without-performance', 'dangling-appraises', 'part-contradicts-conclusion', 'performed-without-conclusion',
  ], 'each incoherent record is a named finding');
}
