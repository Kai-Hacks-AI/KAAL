// Case testing/T385 tests: testing/F159. A Case that cannot be read well is a finding and is never dropped.
import assert from 'node:assert/strict';
import { caseText, load, tree } from './lib.mjs';

export const id = 'testing/T385';
export const tests = ['testing/F159'];
export const title = 'collectCases reports duplicate ids, a missing id, several ids and an id that is not its file number, and keeps the files';

export async function run() {
  const { collectCases } = await load('cases');
  const root = tree({
    'a/T1.test.mjs': caseText('cap/T1'),
    'b/T2.test.mjs': caseText('cap/T2'),
    'c/T2.red.mjs': caseText('cap/T2'),
    'd/T3.test.mjs': 'export const tests = [];\n',
    'e/T4.test.mjs': `${caseText('cap/T4')}export const id = 'cap/T40';\n`,
    'f/T5.test.mjs': caseText('cap/T6'),
  });
  const { cases, findings } = collectCases(root);
  const kinds = (k) => findings.filter((f) => f.kind === k);
  assert.deepEqual(kinds('duplicate-id').map((f) => [f.id, f.files.slice().sort()]), [['cap/T2', ['b/T2.test.mjs', 'c/T2.red.mjs']]], 'a duplicate id names every file that declares it');
  assert.deepEqual(kinds('no-id').map((f) => f.files), [['d/T3.test.mjs']], 'a Case file without an id is named');
  assert.deepEqual(kinds('several-ids').map((f) => f.files), [['e/T4.test.mjs']], 'a file with more than one id is named');
  assert.deepEqual(kinds('id-not-file-number').map((f) => f.files), [['f/T5.test.mjs']], 'an id whose number is not its file number is named');
  assert.ok(cases.some((c) => c.id === 'cap/T1'), 'a well formed Case stays in the list');
  for (const f of findings) assert.ok(Array.isArray(f.files) && f.files.length > 0 && typeof f.detail === 'string', 'each finding names its files and says why');
  assert.deepEqual(findings.map((f) => f.kind).sort(), ['duplicate-id', 'id-not-file-number', 'no-id', 'several-ids'], 'exactly these four findings');
}
