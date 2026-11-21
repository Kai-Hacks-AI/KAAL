// Case testing/T378 tests: testing/F152. The first line of a Case is exact, and the Case id is well formed and agrees with the file.
import { assert, CASES, checkCommand, folder, ELEMENTS, kinds } from './lib.mjs';
export const id = 'testing/T378';
export const tests = ['testing/F152'];
export const title = 'check-cases reports a missing or malformed first line, a Case id that is not <ns>/T<n>, and an id the file declares differently; a well formed Case has no finding';
export function run() {
  const ok = checkCommand(folder(CASES.good), ELEMENTS);
  assert.ok(ok.report, `the installed command printed no report (exit ${ok.status}): ${ok.stderr.split('\n')[0]}`);
  assert.equal(ok.report.schema, 'kaal-testing/case-form@1');
  assert.deepEqual(ok.report.findings, [], 'a well formed Case was reported');
  assert.deepEqual(kinds(checkCommand(folder(CASES.noFirstLine), ELEMENTS).report), ['first-line'], 'a missing first line was not reported alone');
  assert.deepEqual(kinds(checkCommand(folder(CASES.badId), ELEMENTS).report), ['case-id'], 'an id without a namespace was not reported');
  assert.deepEqual(kinds(checkCommand(folder(CASES.idDisagrees), ELEMENTS).report), ['id-differs'], 'an id the file declares differently was not reported');
  const two = checkCommand(folder(CASES.twoTargets), ELEMENTS);
  assert.deepEqual(two.report.findings, [], 'two comma-separated targets are an allowed edge');
  const f = checkCommand(folder(CASES.noFirstLine), ELEMENTS).report.findings[0];
  assert.deepEqual(Object.keys(f).sort(), ['detail', 'file', 'kind', 'line'], 'a finding names where, what and why, nothing more');
}
