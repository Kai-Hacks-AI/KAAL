// Case testing/T384 tests: testing/F158, testing/N36. The Case catalog is computed from the tree, wherever the files sit.
import assert from 'node:assert/strict';
import { caseText, load, tree } from './lib.mjs';

export const id = 'testing/T384';
export const tests = ['testing/F158', 'testing/N36'];
export const title = 'collectCases lists every Case file wherever it sits, reads both quote forms, never runs a file, and is deterministic';

export async function run() {
  const { collectCases } = await load('cases');
  const files = {
    'packages/a/test/T1.test.mjs': caseText('a/T1'),
    'engineering/x/00-changes/C1-y/T2.test.mjs': caseText('x/T2', ['x/F1', 'x/F2'], '"'),
    'deep/er/still/T3.red.mjs': caseText('z/T3'),
    'node_modules/dep/T9.test.mjs': caseText('dep/T9'),
    '.git/T8.test.mjs': caseText('git/T8'),
    'packages/a/test/helper.mjs': caseText('a/T7'),
    'packages/a/test/T4.test.txt': caseText('a/T4'),
    'T10.test.mjs': caseText('root/T10'),
    // a file that must never be run: importing it would throw
    'trap/T5.test.mjs': `${caseText('trap/T5')}\nthrow new Error('imported');\n`,
  };
  const root = tree(files);
  const { cases, findings } = collectCases(root);
  assert.deepEqual(cases.map((c) => c.id), ['a/T1', 'x/T2', 'z/T3', 'trap/T5', 'root/T10'].sort((p, q) => Number(p.split('/T')[1]) - Number(q.split('/T')[1])), 'every Case file is listed once, ordered by number, none under node_modules or .git, none that is not named T<n>.(red|test).mjs');
  assert.deepEqual(findings, [], 'a well formed tree has no finding');
  const x = cases.find((c) => c.id === 'x/T2');
  assert.equal(x.file, 'engineering/x/00-changes/C1-y/T2.test.mjs', 'the file is relative to root with /');
  assert.deepEqual(x.tests, ['x/F1', 'x/F2'], 'double-quoted id and claims read as well');
  assert.equal(x.parked, false);
  assert.equal(cases.find((c) => c.id === 'z/T3').parked, true, '.red.mjs is parked');

  // the same tree, written in another order, gives the same list
  const again = collectCases(tree(Object.fromEntries(Object.entries(files).reverse())));
  assert.deepEqual(again.cases, cases, 'the list does not depend on directory order');
  assert.deepEqual(collectCases(root), { cases, findings }, 'the same twice');
}
