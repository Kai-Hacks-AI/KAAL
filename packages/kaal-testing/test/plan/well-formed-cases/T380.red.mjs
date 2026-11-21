// Case testing/T380 tests: testing/F155, testing/N34. The command reports and does not decide, never reads a Case's prose, and ships abstractly.
import { assert, CASES, checkCommand, folder, ELEMENTS, readFileSync, join, install } from './lib.mjs';
export const id = 'testing/T380';
export const tests = ['testing/F155', 'testing/N34'];
export const title = 'check-cases exits 0 whenever it produced a report, carries no verdict field, is deterministic, and its criterion does not depend on the wording of a Case';
export function run() {
  const dir = folder({ ...CASES.noFirstLine, ...CASES.duplicateId });
  const a = checkCommand(dir, ELEMENTS);
  assert.equal(a.status, 0, 'findings must not turn into a non-zero exit; the consumer decides what fails');
  const b = checkCommand(dir, ELEMENTS);
  assert.equal(a.stdout, b.stdout, 'equal input gave different output');
  for (const key of ['pass', 'ok', 'valid', 'verdict', 'status', 'failed']) assert.ok(!(key in a.report), `a deciding field (${key}) is in the report`);
  const reworded = folder({ 'T900.test.mjs': CASES.good['T900.test.mjs'].replace('A well formed Case.', 'Totally different words, no sentence at all') });
  assert.deepEqual(checkCommand(reworded, ELEMENTS).report.findings, [], 'rewording the prose after the edge changed the result');
  const invalid = checkCommand(folder(CASES.good), { not: 'a list' });
  assert.equal(invalid.status, 2, 'an invalid element list must exit 2 with no report');
  assert.equal(invalid.report, undefined);
  const { root } = install();
  const text = ['lib/form.mjs', 'README.md', 'skills/kaal-testing/SKILL.md'].map((f) => { try { return readFileSync(join(root, f), 'utf8'); } catch { return ''; } }).join('\n');
  assert.ok(text.includes('check-cases'), 'the installed package does not describe check-cases');
  assert.ok(!/\b(engineering|kaal-controls|kaal-release|Guard|Architecture)\b/.test(readFileSync(join(root, 'lib/form.mjs'), 'utf8')), 'lib/form.mjs names a concrete owner or peer');
}
