// Case testing/T417 tests: testing/F176
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

export const id = 'testing/T417';
export const tests = ['testing/F176'];
export const title = 'testing/F176 classifies a mutant as killed by an assertion, survived, invalid or unresolved, and names the survivors';

export async function run() {
  need();
  const { runMutants } = await load();
  const root = tree();
  try {
    const r = await runMutants({ root, spec: spec([
      mutant('M1-killed', 'a + b', 'a - b'),
      mutant('M2-killed-boundary', 'n >= 18', 'n > 18'),
      mutant('M3-survived', 'x * 2', 'x * 3'),
      mutant('M4-invalid-absent', 'a * b', 'a / b'),
      mutant('M5-invalid-twice', 'export const', 'export let'),
      mutant('M6-invalid-same', 'a + b', 'a + b'),
      mutant('M7-unresolved-import', 'x * 2', 'x * 2 +'),
      mutant('M8-unresolved-timeout', 'a + b', '(() => { for (;;) {} })()', ['T1.test.mjs']),
    ]), timeoutMs: 4000 });
    const by = Object.fromEntries(r.mutants.map((m) => [m.id, m]));
    assert.equal(r.schema, 'kaal-testing/mutation-report@1');
    assert.equal(by['M1-killed'].outcome, 'killed');
    assert.ok(by['M1-killed'].killedBy.length >= 1 && by['M1-killed'].killedBy.every((i) => typeof i === 'string'));
    assert.equal(by['M2-killed-boundary'].outcome, 'killed');
    assert.equal(by['M3-survived'].outcome, 'survived', 'code no Case checks survives');
    assert.deepEqual(r.survivors, ['M3-survived']);
    for (const id of ['M4-invalid-absent', 'M5-invalid-twice', 'M6-invalid-same']) {
      assert.equal(by[id].outcome, 'invalid', id);
      assert.equal(typeof by[id].reason, 'string');
    }
    assert.equal(by['M7-unresolved-import'].outcome, 'unresolved', 'a mutant that stops the Case from loading is not killed');
    assert.equal(by['M8-unresolved-timeout'].outcome, 'unresolved', 'a mutant that never ends is not killed');
    assert.ok(by['M8-unresolved-timeout'].problems.some((p) => p.kind === 'timeout'));
    assert.deepEqual(r.counts, { killed: 2, survived: 1, invalid: 3, unresolved: 2 });
    assert.equal(r.complete, false, 'an invalid or unresolved mutant makes the record not complete');
    assert.equal(r.baseline.ok, true);
  } finally { rmSync(root, { recursive: true, force: true }); }
}
