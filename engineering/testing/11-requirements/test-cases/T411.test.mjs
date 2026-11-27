// Case testing/T411 tests: testing/F175
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

export const id = 'testing/T411';
export const tests = ['testing/F175'];
export const title = 'testing/F175 observeAt runs the requested Case files and records GREEN, RED or UNKNOWN with the facts of the run, never GREEN without complete evidence';

export async function run() {
  need();
  const { observeAt } = await load('observation.mjs');
  const root = mkdtempSync(join(tmpdir(), 'kaal-c82-'));
  try {
    writeFileSync(join(root, 'T1.test.mjs'), CASE(1, 'export async function run() {}'));
    writeFileSync(join(root, 'T2.test.mjs'), "import assert from 'node:assert/strict';\n" + CASE(2, 'export async function run() { assert.equal(1, 2); }'));
    writeFileSync(join(root, 'T3.test.mjs'), CASE(3, 'export async function run() { null.x; }'));
    writeFileSync(join(root, 'T4.test.mjs'), CASE(4, 'export async function run() { for (;;) {} }'));
    const input = { root, files: ['T1.test.mjs', 'T2.test.mjs', 'T3.test.mjs', 'T4.test.mjs', 'T9.test.mjs'], revision: REV, expectedRevision: REV, runId: 'run-1', producedBy: 'test', timeoutMs: 4000 };
    await assert.rejects(() => observeAt(input), 'a requested file that is not a file is invalid input, not a silent gap');
    const r = await observeAt({ ...input, files: input.files.slice(0, 4) });
    assert.equal(r.schema, 'kaal-testing/observation@1');
    assert.deepEqual(r.observed, { 'x/T1': 'GREEN', 'x/T2': 'RED', 'x/T3': 'UNKNOWN', 'x/T4': 'UNKNOWN' });
    assert.deepEqual(r.evidence.execution.requested, ['T1.test.mjs', 'T2.test.mjs', 'T3.test.mjs', 'T4.test.mjs']);
    assert.equal(r.evidence.execution.complete, false, 'a timeout makes the run incomplete');
    assert.ok(r.evidence.execution.problems.some((p) => p.kind === 'timeout'));
    assert.equal(r.evidence.revision, REV);
    assert.equal(r.evidence.catalog.complete, true);
    const clean = await observeAt({ ...input, files: ['T1.test.mjs'] });
    assert.equal(clean.evidence.execution.complete, true);
    assert.deepEqual(clean.evidence.integrity, []);
    assert.equal(clean.observed['x/T1'], 'GREEN');
    assert.equal(clean.observed['x/T2'], 'UNKNOWN', 'a cataloged Case that was not requested is not observed GREEN or RED');
    const other = await observeAt({ ...input, files: ['T1.test.mjs'], expectedRevision: 'b'.repeat(40) });
    assert.ok(Object.values(other.observed).every((s) => s === 'UNKNOWN'), 'another revision than the expected one gives no GREEN');
    const anon = await observeAt({ ...input, files: ['T1.test.mjs'], runId: undefined });
    assert.ok(Object.values(anon.observed).every((s) => s === 'UNKNOWN'), 'no run id gives no GREEN');
  } finally { rmSync(root, { recursive: true, force: true }); }
}
