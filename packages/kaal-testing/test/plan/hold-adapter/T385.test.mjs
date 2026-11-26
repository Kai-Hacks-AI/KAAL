// Case testing/T385 tests: testing/F159. A Case that cannot be joined to an observation is named and never dropped. Form rules are testing/C69's and are not decided here.
import assert from 'node:assert/strict';
import { caseText, load, tree } from './lib.mjs';

export const id = 'testing/T385';
export const tests = ['testing/F159'];
export const title = 'collectCases names a duplicate id and a missing id as findings, leaves those Cases out of the list, and judges no other form rule';

export async function run() {
  const { collectCases } = await load('cases');
  const root = tree({
    'a/T1.test.mjs': caseText('cap/T1'),
    'b/T2.test.mjs': caseText('cap/T2'),
    'c/T2.red.mjs': caseText('cap/T2'),
    'd/T3.test.mjs': 'export const tests = [];\n',
    // not this Change's to judge: no first line, an id whose number is not the file's, a target that exists nowhere
    'e/T4.test.mjs': caseText('cap/T9', ['nowhere/F99']),
  });
  const { cases, findings } = await collectCases(root);
  const kinds = (k) => findings.filter((f) => f.kind === k);
  assert.deepEqual(kinds('duplicate-id').map((f) => [f.id, f.files.slice().sort()]), [['cap/T2', ['b/T2.test.mjs', 'c/T2.red.mjs']]], 'a duplicate id names every file that declares it');
  assert.deepEqual(kinds('no-id').map((f) => f.files), [['d/T3.test.mjs']], 'a Case file without an id is named');
  assert.deepEqual(findings.map((f) => f.kind).sort(), ['duplicate-id', 'no-id'], 'only these two findings: form rules belong to testing/C69');
  for (const f of findings) assert.ok(Array.isArray(f.files) && f.files.length > 0 && typeof f.detail === 'string', 'each finding names its files and says why');
  assert.deepEqual(cases.map((c) => c.id), ['cap/T1', 'cap/T9'], 'a Case that cannot be joined is not listed; one with an id is, whatever else is wrong with its form');
}
