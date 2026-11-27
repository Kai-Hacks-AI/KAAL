// Case testing/T418 tests: testing/F176
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const pkg = process.env.KAAL_TESTING_PKG ? resolve(process.env.KAAL_TESTING_PKG) : join(repo, 'packages/kaal-testing');
const need = () => assert.ok(existsSync(join(pkg, 'lib/mutate.mjs')), 'lib/mutate.mjs is absent');
const load = async () => import(pathToFileURL(join(pkg, 'lib/mutate.mjs')).href);

// A tiny subject and two Cases that check part of it (the mutants are what the Cases must or must not detect).
const LIB = 'export const add = (a, b) => a + b;\nexport const isAdult = (n) => n >= 18;\nexport const unused = (x) => x * 2;\nexport const twice = (x) => x + x;\n';
const CASE1 = "import assert from 'node:assert/strict';\nimport { add, twice } from './src/lib.mjs';\nexport const id = 'x/T1';\nexport const tests = ['x/F1'];\nexport async function run() { assert.equal(add(1, 2), 3); assert.equal(twice(2), 4); }\n";
const CASE2 = "import assert from 'node:assert/strict';\nimport { isAdult } from './src/lib.mjs';\nexport const id = 'x/T2';\nexport const tests = ['x/F1'];\nexport async function run() { assert.equal(isAdult(18), true); assert.equal(isAdult(17), false); }\n";
function tree(extra = {}) {
  const root = mkdtempSync(join(tmpdir(), 'kaal-c83-'));
  mkdirSync(join(root, 'src'));
  writeFileSync(join(root, 'src/lib.mjs'), LIB);
  writeFileSync(join(root, 'T1.test.mjs'), CASE1);
  writeFileSync(join(root, 'T2.test.mjs'), CASE2);
  for (const [name, text] of Object.entries(extra)) writeFileSync(join(root, name), text);
  return root;
}
const digest = (dir) => readdirSync(dir, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).map((e) => { const p = join(e.parentPath ?? e.path, e.name); return `${p}:${readFileSync(p).toString('base64')}`; }).sort().join('\n');
const mutant = (id, find, replace, cases = ['T1.test.mjs', 'T2.test.mjs'], file = 'src/lib.mjs') => ({ id, file, find, replace, cases });
const spec = (mutants) => ({ schema: 'kaal-testing/mutants@1', mutants });

export const id = 'testing/T418';
export const tests = ['testing/F176'];
export const title = 'testing/F176 a record is complete only when the baseline is ok and every mutant is killed or survived, a bad baseline makes every mutant invalid, and root is never changed';

export async function run() {
  need();
  const { runMutants } = await load();
  const root = tree();
  try {
    const before = digest(root);
    const ok = await runMutants({ root, spec: spec([mutant('K', 'a + b', 'a - b'), mutant('S', 'x * 2', 'x * 3')]), timeoutMs: 4000 });
    assert.deepEqual(ok.counts, { killed: 1, survived: 1, invalid: 0, unresolved: 0 });
    assert.equal(ok.complete, true, 'every mutant killed or survived, baseline ok');
    assert.equal(ok.baseline.ok, true);
    assert.equal(digest(root), before, 'root is the same after a run');
  } finally { rmSync(root, { recursive: true, force: true }); }

  // A baseline that is RED: nothing a mutant does can then be read.
  const red = tree({ 'T3.test.mjs': "import assert from 'node:assert/strict';\nexport const id = 'x/T3';\nexport const tests = ['x/F1'];\nexport async function run() { assert.equal(1, 2); }\n" });
  try {
    const r = await runMutants({ root: red, spec: spec([mutant('K', 'a + b', 'a - b', ['T1.test.mjs', 'T3.test.mjs'])]), timeoutMs: 4000 });
    assert.equal(r.baseline.ok, false);
    assert.equal(r.mutants[0].outcome, 'invalid', 'a mutant is not killed by a Case that was already RED');
    assert.match(r.mutants[0].reason, /baseline/);
    assert.equal(r.complete, false);
  } finally { rmSync(red, { recursive: true, force: true }); }

  // A Case file with no test and no run is empty-inventory: the baseline is not ok.
  const empty = tree({ 'T4.test.mjs': "export const id = 'x/T4';\n" });
  try {
    const r = await runMutants({ root: empty, spec: spec([mutant('K', 'a + b', 'a - b', ['T1.test.mjs', 'T4.test.mjs'])]), timeoutMs: 4000 });
    assert.equal(r.baseline.ok, false, 'a file with no test is not a baseline');
    assert.equal(r.mutants[0].outcome, 'invalid');
  } finally { rmSync(empty, { recursive: true, force: true }); }

  // Invalid specs are refused before anything runs.
  const bad = tree();
  try {
    await assert.rejects(() => runMutants({ root: bad, spec: { schema: 'other@1', mutants: [] } }), 'a wrong schema');
    await assert.rejects(() => runMutants({ root: bad, spec: spec([]) }), 'no mutants');
    await assert.rejects(() => runMutants({ root: bad, spec: spec([mutant('D', 'a + b', 'a - b'), mutant('D', 'x * 2', 'x * 3')]) }), 'a duplicate id');
    await assert.rejects(() => runMutants({ root: bad, spec: spec([mutant('O', 'a', 'b', ['T1.test.mjs'], '../outside.mjs')]) }), 'a file outside root');
    await assert.rejects(() => runMutants({ root: bad, spec: spec([mutant('O', 'a + b', 'a - b', ['../T1.test.mjs'])]) }), 'a Case outside root');
  } finally { rmSync(bad, { recursive: true, force: true }); }
}
