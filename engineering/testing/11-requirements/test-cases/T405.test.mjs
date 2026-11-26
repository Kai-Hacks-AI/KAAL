// Case testing/T405 tests: testing/F174
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const { runCases } = await import(pathToFileURL(join(process.env.KAAL_TESTING_PKG ? resolve(process.env.KAAL_TESTING_PKG) : join(repo, 'packages/kaal-testing'), 'lib/run.mjs')).href);

async function report(files) {
  const root = mkdtempSync(join(tmpdir(), 'kaal-c81-'));
  try {
    for (const [name, text] of Object.entries(files)) writeFileSync(join(root, name), text);
    return await runCases({ files: Object.keys(files), root });
  } finally { rmSync(root, { recursive: true, force: true }); }
}
const only = (r, file) => r.tests.filter((t) => t.file === file);
const problems = (r, file) => r.execution.problems.filter((p) => p.file === file);

export const id = 'testing/T405';
export const tests = ['testing/F174'];
export const title = 'testing/F174 runs a Case in the export form as one test under its own file: returning is GREEN, an assertion error is RED, any other error is UNKNOWN';

export async function run() {
  const r = await report({
    'ok.test.mjs': "export const id = 'x/T1';\nexport async function run() {}\n",
    'red.test.mjs': "import assert from 'node:assert/strict';\nexport const id = 'x/T2';\nexport async function run() { assert.equal(1, 2); }\n",
    'err.test.mjs': "export const id = 'x/T3';\nexport async function run() { null.x; }\n",
  });
  const ok = only(r, 'ok.test.mjs');
  assert.equal(ok.length, 1, 'a returning run() is one test under its own file');
  assert.equal(ok[0].actual, 'GREEN');
  assert.equal(problems(r, 'ok.test.mjs').length, 0, 'it leaves no problem, so the run of that file is complete');
  const red = only(r, 'red.test.mjs');
  assert.equal(red.length, 1);
  assert.equal(red[0].actual, 'RED', 'an assertion error is RED');
  const err = only(r, 'err.test.mjs');
  assert.equal(err.length, 1);
  assert.equal(err[0].actual, 'UNKNOWN', 'any other error is UNKNOWN, never RED');
  assert.equal(err[0].reason, 'error');
  assert.equal(r.schema, 'kaal-testing/run-report@1');
}
