// Case testing/T406 tests: testing/F174
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

export const id = 'testing/T406';
export const tests = ['testing/F174'];
export const title = 'testing/F174 keeps the run of a node:test file, and an empty or non-callable run or unimportable file is still a problem, never a pass';

export async function run() {
  const r = await report({
    'nodetest.test.mjs': "import { test } from 'node:test';\ntest('a', () => {});\n",
    'empty.test.mjs': "export const id = 'x/T4';\n",
    'notcallable.test.mjs': "export const id = 'x/T5';\nexport const run = 42;\n",
    'both.test.mjs': "import assert from 'node:assert/strict';\nimport { test } from 'node:test';\nexport const id = 'x/T6';\ntest('t', () => {});\nexport async function run() { assert.equal(1, 2); }\n",
    'broken.test.mjs': 'export const id = ;\n',
  });
  assert.deepEqual(only(r, 'nodetest.test.mjs').map((t) => t.actual), ['GREEN'], 'a node:test file reports its tests as before');
  assert.equal(only(r, 'empty.test.mjs').length, 0);
  assert.deepEqual(problems(r, 'empty.test.mjs').map((p) => p.kind), ['empty-inventory'], 'a file with neither tests nor run is empty-inventory');
  assert.equal(only(r, 'notcallable.test.mjs').length, 0, 'a run that is not callable is not executed');
  assert.deepEqual(problems(r, 'notcallable.test.mjs').map((p) => p.kind), ['empty-inventory']);
  assert.deepEqual(only(r, 'both.test.mjs').map((t) => t.actual).sort(), ['GREEN', 'RED'], 'a file with node:test tests and a callable run reports both');
  assert.deepEqual(problems(r, 'broken.test.mjs').map((p) => p.kind), ['file-failed'], 'an unimportable file is a problem of that file');
  assert.equal(r.execution.complete, false);
}
