// Case testing/T391 tests: testing/F164. One reader of Case identity with the catalog (testing/C74).
import { assert, CASES, folder, install, join, readFileSync, sh } from './lib.mjs';
import { pathToFileURL } from 'node:url';
export const id = 'testing/T391';
export const tests = ['testing/F164'];
export const title = 'check-cases discovers the Case files the catalog lists, in either quote form, checks a Case of wrong form instead of dropping it, and reads declarations through the catalog';
export async function run() {
  const dir = folder({
    'T910.test.mjs': "// Case testing/T910 tests: testing/F1\nexport const id = 'testing/T910';\nexport const tests = ['testing/F1'];\n",
    'T911.test.mjs': '// Case testing/T911 tests: testing/F1\nexport const id = "testing/T911";\nexport const tests = ["testing/F1"];\n',
    ...CASES.noFirstLine,
  });
  const { root, bin } = install();
  const r = sh(bin, ['check-cases', '--root', dir], { cwd: dir });
  let report;
  try { report = JSON.parse(r.stdout); } catch { report = undefined; }
  assert.ok(report, `check-cases --root without files printed no report (exit ${r.status}): ${r.stderr.split('\n')[0]}`);
  const catalog = await import(pathToFileURL(join(root, 'lib/cases.mjs')).href);
  const listed = catalog.collectCases(dir).cases.map((c) => c.file).sort();
  assert.ok(listed.includes('T910.test.mjs') && listed.includes('T911.test.mjs') && listed.includes('T901.test.mjs'), 'the catalog lists the single-quoted, the double-quoted and the malformed Case');
  assert.deepEqual([...report.files].sort(), listed, 'check-cases checks exactly the Case files the catalog lists');
  assert.ok(report.findings.some((f) => f.kind === 'first-line' && f.file === 'T901.test.mjs'), 'a Case with no first line is reported and not dropped');
  assert.ok(!report.findings.some((f) => f.file === 'T911.test.mjs'), 'a double-quoted id is not a finding');
  const form = readFileSync(join(root, 'lib/form.mjs'), 'utf8');
  assert.match(form, /from ['"]\.\/cases\.mjs['"]/, 'lib/form.mjs reads declarations through the catalog');
  assert.doesNotMatch(form, /export const id/, 'and holds no id pattern of its own');
}
