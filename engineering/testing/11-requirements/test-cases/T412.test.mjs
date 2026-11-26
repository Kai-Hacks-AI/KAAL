// Case testing/T412 tests: testing/F175
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

export const id = 'testing/T412';
export const tests = ['testing/F175'];
export const title = 'testing/F175 assembleObservation reads a run report as untrusted data: a report that is not what was asked for gives UNKNOWN for every Case, with a named finding';

const cases = [{ id: 'x/T1', file: 'T1.test.mjs', tests: ['x/F1'], parked: false }, { id: 'x/T2', file: 'T2.test.mjs', tests: ['x/F1'], parked: false }];
const test = (file, name, actual = 'GREEN') => ({ id: `${file} > ${name}`, file, path: [], name, role: 'leaf', actual, case: null });
const report = (over = {}) => ({
  schema: 'kaal-testing/run-report@1', counts: { GREEN: 2, RED: 0, UNKNOWN: 0 }, diagnostics: [],
  tests: [test('T1.test.mjs', 'x/T1'), test('T2.test.mjs', 'x/T2')],
  execution: { complete: true, timeoutMs: 1000, node: '24.0.0', files: ['T1.test.mjs', 'T2.test.mjs'], problems: [] },
  ...over,
});

export async function run() {
  need();
  const { assembleObservation } = await load('observation.mjs');
  const { observeCases } = await load('observe.mjs');
  const base = { requested: ['T1.test.mjs', 'T2.test.mjs'], cases, findings: [], revision: REV, expectedRevision: REV, runId: 'r', producedBy: 't' };

  const good = assembleObservation({ ...base, report: report() });
  const plain = observeCases({ report: report(), cases, findings: [], revision: REV, expectedRevision: REV, runId: 'r', producedBy: 't' });
  assert.deepEqual(good.observed, plain.observed, 'a well formed report gives the observed map of observe');
  assert.deepEqual(good.observed, { 'x/T1': 'GREEN', 'x/T2': 'GREEN' });
  assert.equal(good.evidence.catalog.complete, plain.evidence.catalog.complete);
  assert.equal(good.evidence.revision, REV);

  const bad = {
    'omits a requested file': report({ tests: [test('T1.test.mjs', 'x/T1')], execution: { ...report().execution, files: ['T1.test.mjs'] } }),
    'names a file that was not requested': report({ execution: { ...report().execution, files: ['T1.test.mjs', 'T2.test.mjs', 'Tz.test.mjs'] } }),
    'has a test of an unrequested file': report({ tests: [...report().tests, test('Tz.test.mjs', 'x/Tz')] }),
    'repeats a test id': report({ tests: [...report().tests, test('T1.test.mjs', 'x/T1')] }),
    'is not a run report': { schema: 'something/else@1', tests: [], execution: {} },
  };
  for (const [name, r] of Object.entries(bad)) {
    const o = assembleObservation({ ...base, report: r });
    assert.ok(Object.values(o.observed).every((s) => s === 'UNKNOWN'), `a report that ${name} gives no GREEN and no RED`);
    assert.equal(o.evidence.catalog.complete, false, `${name}: the catalog is not complete`);
    assert.equal(o.evidence.execution.complete, false, `${name}: the run is not complete`);
    assert.ok(o.evidence.integrity.length >= 1 && o.evidence.integrity.every((f) => typeof f.kind === 'string' && typeof f.detail === 'string'), `${name}: the finding is named`);
  }
}
