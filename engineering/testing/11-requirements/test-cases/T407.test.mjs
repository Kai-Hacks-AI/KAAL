// Case testing/T407 tests: testing/F174
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const pkg = process.env.KAAL_TESTING_PKG ? resolve(process.env.KAAL_TESTING_PKG) : join(repo, 'packages/kaal-testing');
const load = (name) => import(pathToFileURL(join(pkg, 'lib', name)).href);
const { runCases } = await load('run.mjs');
const { collectCases } = await load('cases.mjs');
const { observeCases } = await load('observe.mjs');

export const id = 'testing/T407';
export const tests = ['testing/F174'];
export const title = 'testing/F174 end to end: run, then observe against the catalog and the judged revision, reads an export-form Case GREEN, RED or UNKNOWN, and never GREEN without complete evidence';

const CASES = {
  'T1.test.mjs': "export const id = 'x/T1';\nexport const tests = ['x/F1'];\nexport async function run() {}\n",
  'T2.test.mjs': "import assert from 'node:assert/strict';\nexport const id = 'x/T2';\nexport const tests = ['x/F1'];\nexport async function run() { assert.equal(1, 2); }\n",
  'T3.test.mjs': "export const id = 'x/T3';\nexport const tests = ['x/F1'];\nexport async function run() { null.x; }\n",
  'T4.test.mjs': "export const id = 'x/T4';\nexport const tests = ['x/F1'];\nexport async function run() { for (;;) {} }\n",
  'T5.test.mjs': "export const id = ;\nexport async function run() {}\n",
  'T6.test.mjs': "export const id = 'x/T6';\nexport const tests = ['x/F1'];\nexport async function run() {}\n",
};
const REV = 'a'.repeat(40);

export async function run() {
  const root = mkdtempSync(join(tmpdir(), 'kaal-c81-e2e-'));
  try {
    for (const [name, text] of Object.entries(CASES)) writeFileSync(join(root, name), text);
    const { cases, findings } = await collectCases(root);
    const files = Object.keys(CASES).filter((f) => f !== 'T6.test.mjs'); // T6 is cataloged but left out of the run
    const report = await runCases({ files, root, timeoutMs: 4000 });
    const at = (extra = {}) => observeCases({ report, cases, findings, revision: REV, expectedRevision: REV, runId: 'run-1', producedBy: 'test', ...extra });

    const { observed, evidence } = at();
    assert.equal(observed['x/T1'], 'GREEN', 'a returning export-form Case is GREEN');
    assert.equal(evidence.reasons['x/T1'], undefined, 'and carries no reason');
    assert.equal(observed['x/T2'], 'RED', 'an assertion failure is RED');
    assert.equal(observed['x/T3'], 'UNKNOWN', 'an execution error is UNKNOWN');
    assert.equal(observed['x/T4'], 'UNKNOWN', 'a Case that never ends (timeout) is UNKNOWN');
    assert.equal(observed['x/T6'], 'UNKNOWN', 'a cataloged file that was not run is UNKNOWN');
    assert.equal(report.execution.complete, false, 'the run with a timeout and an unimportable file is incomplete');
    assert.ok(findings.some((f) => f.kind === 'no-id') && observed['x/T5'] === undefined, 'the unimportable file declares no readable id, so the catalog marks itself incomplete');
    assert.equal(evidence.catalog.complete, false, 'incomplete catalog evidence is stated, not hidden');

    const other = at({ expectedRevision: 'b'.repeat(40) });
    assert.ok(Object.values(other.observed).every((s) => s === 'UNKNOWN'), 'a report of another revision than the judged one gives no GREEN');
    const anon = at({ runId: undefined });
    assert.ok(Object.values(anon.observed).every((s) => s === 'UNKNOWN'), 'a report without a run id gives no GREEN');

    // A run that ends complete and passes: T1 alone.
    const clean = await runCases({ files: ['T1.test.mjs'], root, timeoutMs: 4000 });
    assert.equal(clean.execution.complete, true);
    const only = observeCases({ report: clean, cases: cases.filter((c) => c.id === 'x/T1'), findings: [], revision: REV, expectedRevision: REV, runId: 'run-2', producedBy: 'test' });
    assert.deepEqual(only.observed, { 'x/T1': 'GREEN' });
    assert.equal(only.evidence.catalog.complete, true);
  } finally { rmSync(root, { recursive: true, force: true }); }
}
