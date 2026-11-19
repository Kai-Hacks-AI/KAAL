// Case testing/T370 tests: testing/F146. A packed kaal-testing installs into an empty project and runs the consumer's own tests.
import assert from 'node:assert/strict';
import { existsSync, install, join, readdirSync, sh, writeFileSync } from './lib.mjs';
export const id = 'testing/T370';
export const tests = ['testing/F146'];
export const title = 'a packed kaal-testing installs into an empty project outside any repository and its installed command runs the consumer\'s own tests and reports them';
export async function run() {
  const { project, root } = install();
  assert.ok(existsSync(join(root, 'bin/kaal-testing.mjs')), 'the installed package has no command: bin/kaal-testing.mjs is absent');
  const bin = join(project, 'node_modules/.bin/kaal-testing');
  assert.ok(existsSync(bin), 'npm linked no kaal-testing command into node_modules/.bin');

  writeFileSync(join(project, 'sample.test.mjs'), "import test from 'node:test';\nimport assert from 'node:assert/strict';\ntest('adds', () => assert.equal(1 + 1, 2));\ntest('subtracts wrongly', () => assert.equal(2 - 1, 2));\n");
  const r = sh(bin, ['run', 'sample.test.mjs'], { cwd: project });
  assert.equal(r.status, 0, `the installed command failed on a consumer file: ${r.stderr}`);
  const report = JSON.parse(r.stdout);
  assert.equal(report.schema, 'kaal-testing/run-report@1', 'the report is not the run report');
  assert.deepEqual(report.counts, { GREEN: 1, RED: 1, UNKNOWN: 0 }, 'a passing and a failing test of the consumer are counted one GREEN and one RED');
  assert.equal(report.execution.complete, true);
  assert.ok(report.tests.every((t) => t.id.startsWith('sample.test.mjs')), 'ids are relative to the consumer project, not to a KAAL repository');

  const entry = sh(process.execPath, ['--input-type=module', '-e', "const m = await import('kaal-testing/run'); console.log(typeof m.runCases, typeof m.compareReports)"], { cwd: project });
  assert.equal(entry.status, 0, `the exported entry does not load from the installed package (is a dependency missing?): ${entry.stderr}`);
  assert.equal(entry.stdout.trim(), 'function function');

  const top = readdirSync(project).sort();
  assert.deepEqual(top, ['node_modules', 'package-lock.json', 'package.json', 'sample.test.mjs'], 'running wrote something into the consumer project');
}
