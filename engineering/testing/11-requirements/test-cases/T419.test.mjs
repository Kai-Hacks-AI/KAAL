// Case testing/T419 tests: testing/F176
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

export const id = 'testing/T419';
export const tests = ['testing/F176'];
export const title = 'testing/F176 the command mutate writes mutation-report.json and exits 0 when a mutant survived, and exits 2 writing nothing for an invalid spec';

export async function run() {
  need();
  const root = tree();
  try {
    const call = (args) => spawnSync(process.execPath, [join(pkg, 'bin/kaal-testing.mjs'), 'mutate', ...args], { encoding: 'utf8' });
    const out = join(root, 'out');
    writeFileSync(join(root, 'mutants.json'), JSON.stringify(spec([mutant('K', 'a + b', 'a - b'), mutant('S', 'x * 2', 'x * 3')])));
    const ok = call(['--root', root, '--spec', join(root, 'mutants.json'), '--out', out, '--timeout', '4000']);
    assert.equal(ok.status, 0, `a surviving mutant is a result, not an error: ${ok.stderr}`);
    const rec = JSON.parse(readFileSync(join(out, 'mutation-report.json'), 'utf8'));
    assert.equal(rec.schema, 'kaal-testing/mutation-report@1');
    assert.deepEqual(rec.survivors, ['S']);
    assert.equal(rec.complete, true);

    const none = join(root, 'none');
    writeFileSync(join(root, 'bad.json'), JSON.stringify({ schema: 'kaal-testing/mutants@1', mutants: [] }));
    const bad = call(['--root', root, '--spec', join(root, 'bad.json'), '--out', none]);
    assert.equal(bad.status, 2, 'an empty list is invalid input');
    assert.equal(existsSync(join(none, 'mutation-report.json')), false, 'invalid input writes nothing');
    assert.equal(call(['--root', root, '--out', none]).status, 2, 'a missing --spec is invalid input');
    assert.equal(call(['--root', root, '--spec', join(root, 'mutants.json')]).status, 2, 'a missing --out is invalid input');
    writeFileSync(join(root, 'garbage.json'), 'not json');
    assert.equal(call(['--root', root, '--spec', join(root, 'garbage.json'), '--out', none]).status, 2, 'a spec that is not JSON is invalid input');
  } finally { rmSync(root, { recursive: true, force: true }); }
}
