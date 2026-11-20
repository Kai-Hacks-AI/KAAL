// Case testing/T379 tests: testing/F153, testing/F154. Case ids are unique across the files given, and every target exists among the elements the caller supplies.
import { assert, CASES, checkCommand, folder, ELEMENTS, kinds } from './lib.mjs';
export const id = 'testing/T379';
export const tests = ['testing/F153', 'testing/F154'];
export const title = 'check-cases reports a duplicate Case id and a target that is not a known element; with no element list the targets are unchecked, never passed';
export function run() {
  const dup = checkCommand(folder(CASES.duplicateId), ELEMENTS);
  assert.ok(dup.report, `the installed command printed no report: ${dup.stderr.split('\n')[0]}`);
  assert.deepEqual(kinds(dup.report), ['duplicate-id', 'duplicate-id'], 'a duplicate Case id is reported against each file that carries it');
  const unknown = checkCommand(folder(CASES.unknownTarget), ELEMENTS);
  assert.deepEqual(kinds(unknown.report), ['target-missing']);
  assert.match(unknown.report.findings[0].detail, /testing\/F99/, 'the finding does not name the missing target');
  const without = checkCommand(folder(CASES.unknownTarget));
  assert.ok(without.report, 'no element list must still give a report');
  assert.deepEqual(without.report.findings, [], 'targets cannot be called missing without a list of elements');
  assert.equal(without.report.targets.checked, false, 'targets are reported as unchecked when no element list was given');
  assert.equal(checkCommand(folder(CASES.good), ELEMENTS).report.targets.checked, true);
}
