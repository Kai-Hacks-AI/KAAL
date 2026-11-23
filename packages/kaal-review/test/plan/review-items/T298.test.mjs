// Case review/T298 tests: review/F27. The definition of a Review item.
import assert from 'node:assert/strict';
import { item, load, tree } from './lib.mjs';
export const id = 'review/T298';
export const tests = ['review/F27'];
export const title = 'a Review item is listed with its subjects, question, criteria and expected evidence wherever it sits, for subjects of any kind, and a malformed item is a named finding and never listed';
export async function run() {
  const navigate = await load();
  const root = tree({
    'alpha/review-items/V1.md': item('ns/V1', { validates: ['x/I1'], question: 'Is the intent stated once?', criteria: ['one sentence', 'no restatement'], evidence: ['the document', 'a trial'] }),
    'beta/deep/place/V2.md': item('ns/V2', { validates: ['path:AGENTS.md', 'x/F2', 'x/T9', 'x/D3'] }),
    'gamma/V3.md': item('ns/V3', { validates: ['ns/V1', 'ns/RV1'] }),
    'delta/V4.md': item('ns/V4', {}),
    'delta/V5.md': item('ns/V5', { validates: ['x/F2'], question: undefined }),
    'delta/V6.md': item('ns/V6', { validates: ['x/F2'], criteria: undefined }),
    'delta/V7.md': item('ns/V7', { validates: ['x/F2'], evidence: undefined }),
    'eps/V1.md': item('ns/V1', { validates: ['x/I9'] }),
    'zeta/V8.md': '---\nvalidates: [x/I1]\n---\n# no id\n',
  });
  const nav = await navigate(root);
  assert.deepEqual(nav.items.map((i) => i.id), ['ns/V2', 'ns/V3'], 'only the well-formed items with a unique id are listed, in number order; a duplicated id is listed by none of its files');
  const v2 = nav.items.find((i) => i.id === 'ns/V2');
  assert.deepEqual(v2.validates, ['path:AGENTS.md', 'x/F2', 'x/T9', 'x/D3'], 'subjects of any kind are accepted: a path, a requirement, a Case, a defect');
  assert.ok(v2.question && v2.criteria.length > 0 && v2.evidence.length > 0, 'an item lists its question, criteria and expected evidence');
  assert.deepEqual(nav.items.find((i) => i.id === 'ns/V3').validates, ['ns/V1', 'ns/RV1'], 'an item or a result may be validated');
  const found = nav.findings.map((f) => `${f.kind}:${f.files.map((x) => x.split('/').slice(-2).join('/')).join('+')}`).sort();
  assert.deepEqual(found, [
    'duplicate-id:review-items/V1.md+eps/V1.md',
    'item-incomplete:delta/V4.md', 'item-incomplete:delta/V5.md', 'item-incomplete:delta/V6.md', 'item-incomplete:delta/V7.md',
    'no-id:zeta/V8.md',
  ].sort(), 'each malformed item is a finding with its path, and none is dropped silently');
  assert.ok(nav.findings.every((f) => typeof f.detail === 'string' && f.detail.length > 0), 'a finding says what is wrong');
}
