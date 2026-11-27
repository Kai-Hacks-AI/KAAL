// Case testing/T424 tests: testing/F177
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const pkg = process.env.KAAL_TESTING_PKG ? resolve(process.env.KAAL_TESTING_PKG) : join(repo, 'packages/kaal-testing');
const need = () => assert.ok(existsSync(join(pkg, 'lib/identity.mjs')), 'lib/identity.mjs is absent');

const cases = [{ id: 'x/T1', file: 'T1.test.mjs', tests: ['x/F1'], parked: false }];
const test = (file, name) => ({ id: `${file} > ${name}`, file, path: [], name, role: 'leaf', actual: 'GREEN', case: null });
const report = () => ({
  schema: 'kaal-testing/run-report@1', counts: { GREEN: 1, RED: 0, UNKNOWN: 0 }, diagnostics: [],
  tests: [test('T1.test.mjs', 'x/T1')],
  execution: { complete: true, timeoutMs: 1000, node: '24.0.0', files: ['T1.test.mjs'], problems: [] },
});
const base = { report: report(), requested: ['T1.test.mjs'], cases, findings: [], runId: 'r', producedBy: 't' };

export const id = 'testing/T424';
export const tests = ['testing/F177'];
export const title = 'testing/F177 the observation record makes every Case UNKNOWN, with a named finding, when its identity is not the examined one, and is unchanged when they are equal, whatever the identity looks like';

export async function run() {
  need();
  const { assembleObservation } = await import(pathToFileURL(join(pkg, 'lib/observation.mjs')).href);

  for (const id of ['d836d936'.padEnd(40, '1'), 'sha256:9f2c4a', 'build-2026.11.27']) {
    const good = assembleObservation({ ...base, revision: id, expectedRevision: id });
    assert.deepEqual(good.observed, { 'x/T1': 'GREEN' }, `equal identities are observed as before: ${id}`);
    assert.deepEqual(good.evidence.integrity, []);
    assert.equal(good.evidence.catalog.complete, true);
    assert.equal(good.schema, 'kaal-testing/observation@1', 'the record keeps its schema and its fields');
    assert.equal(good.evidence.revision, id);
  }

  const other = assembleObservation({ ...base, revision: 'tree:aaa', expectedRevision: 'tree:bbb' });
  assert.deepEqual(other.observed, { 'x/T1': 'UNKNOWN' }, 'content other than the examined gives no GREEN');
  assert.deepEqual(other.evidence.integrity.map((f) => f.kind), ['recorded-not-examined'], 'and the finding says so');
  assert.equal(other.evidence.catalog.complete, false);

  const noRecorded = assembleObservation({ ...base, expectedRevision: 'tree:bbb' });
  assert.deepEqual(noRecorded.observed, { 'x/T1': 'UNKNOWN' });
  assert.deepEqual(noRecorded.evidence.integrity.map((f) => f.kind), ['recorded-identity-missing']);

  const noExamined = assembleObservation({ ...base, revision: 'tree:aaa' });
  assert.deepEqual(noExamined.observed, { 'x/T1': 'UNKNOWN' });
  assert.deepEqual(noExamined.evidence.integrity.map((f) => f.kind), ['examined-identity-missing']);

  const blank = assembleObservation({ ...base, revision: '  ', expectedRevision: '  ' });
  assert.deepEqual(blank.observed, { 'x/T1': 'UNKNOWN' }, 'two equal blank identities are not evidence of content');
  assert.deepEqual(blank.evidence.integrity.map((f) => f.kind), ['examined-identity-missing', 'recorded-identity-missing']);
}
