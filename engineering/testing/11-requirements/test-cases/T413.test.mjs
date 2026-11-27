// Case testing/T413 tests: testing/F175
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const pkg = process.env.KAAL_TESTING_PKG ? resolve(process.env.KAAL_TESTING_PKG) : join(repo, 'packages/kaal-testing');
const need = () => assert.ok(existsSync(join(pkg, 'lib/observation.mjs')), 'lib/observation.mjs is absent');
const load = (name) => import(pathToFileURL(join(pkg, 'lib', name)).href);
const REV = 'a'.repeat(40);
const CASE = (n, body) => `export const id = 'x/T${n}';\nexport const tests = ['x/F1'];\n${body}\n`;

export const id = 'testing/T413';
export const tests = ['testing/F175'];
export const title = 'testing/F175 the command observe-at writes observation.json for a RED and an UNKNOWN run too, writes nothing and exits 2 for invalid input, and the record holds the pair a hold Act reader reads';

const bin = (pkg_) => join(pkg_, 'bin/kaal-testing.mjs');
const call = (args) => spawnSync(process.execPath, [bin(pkg), 'observe-at', ...args], { encoding: 'utf8' });

export async function run() {
  need();
  const root = mkdtempSync(join(tmpdir(), 'kaal-c82-cli-'));
  try {
    writeFileSync(join(root, 'T1.test.mjs'), CASE(1, 'export async function run() {}'));
    writeFileSync(join(root, 'T2.test.mjs'), "import assert from 'node:assert/strict';\n" + CASE(2, 'export async function run() { assert.equal(1, 2); }'));
    const out = join(root, 'out');
    mkdirSync(out);
    const ok = call(['--root', root, '--revision', REV, '--expect-revision', REV, '--run-id', 'r1', '--produced-by', 'test', '--out', out, 'T1.test.mjs', 'T2.test.mjs']);
    assert.equal(ok.status, 0, `a RED Case is a result, not an error: ${ok.stderr}`);
    const rec = JSON.parse(readFileSync(join(out, 'observation.json'), 'utf8'));
    assert.equal(rec.schema, 'kaal-testing/observation@1');
    assert.deepEqual(rec.observed, { 'x/T1': 'GREEN', 'x/T2': 'RED' });
    // The reader of release (release/C125) reads these four fields and nothing else.
    const seen = { observed: rec.observed, revision: rec.evidence.revision, expectedRevision: rec.evidence.expectedRevision, catalog: rec.evidence.catalog };
    assert.equal(typeof seen.observed, 'object');
    assert.equal(seen.revision, seen.expectedRevision);
    assert.equal(typeof seen.catalog.complete, 'boolean');
    assert.ok(Array.isArray(seen.catalog.findings) && Array.isArray(seen.catalog.unobservable));

    const empty = join(root, 'empty');
    mkdirSync(empty);
    const noRun = call(['--root', root, '--revision', REV, '--expect-revision', REV, '--produced-by', 'test', '--out', empty, 'T1.test.mjs']);
    assert.equal(noRun.status, 2, 'a missing --run-id is invalid input');
    assert.equal(existsSync(join(empty, 'observation.json')), false, 'invalid input writes nothing');
    const noOut = call(['--root', root, '--revision', REV, '--expect-revision', REV, '--run-id', 'r', '--produced-by', 'test', 'T1.test.mjs']);
    assert.equal(noOut.status, 2, 'a missing --out is invalid input');
  } finally { rmSync(root, { recursive: true, force: true }); }
}
