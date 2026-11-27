// Case testing/T424 tests: testing/F177
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const pkg = process.env.KAAL_TESTING_PKG ? resolve(process.env.KAAL_TESTING_PKG) : join(repo, 'packages/kaal-testing');
const need = () => assert.ok(existsSync(join(pkg, 'lib/revision.mjs')), 'lib/revision.mjs is absent');

const HEAD = 'd836d936'.padEnd(40, '1');
const MERGE = 'd4751363'.padEnd(40, '2');
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
export const title = 'testing/F177 the observation record makes every Case UNKNOWN, with a named finding, when it records the trigger or a short id instead of the judged revision';

export async function run() {
  need();
  const { assembleObservation } = await import(pathToFileURL(join(pkg, 'lib/observation.mjs')).href);

  const good = assembleObservation({ ...base, revision: HEAD, expectedRevision: HEAD, triggerRevision: MERGE });
  assert.deepEqual(good.observed, { 'x/T1': 'GREEN' }, 'the judged head recorded as the revision is observed as before');
  assert.deepEqual(good.evidence.integrity, []);
  assert.equal(good.evidence.catalog.complete, true);

  const d20 = assembleObservation({ ...base, revision: MERGE, expectedRevision: HEAD, triggerRevision: MERGE });
  assert.deepEqual(d20.observed, { 'x/T1': 'UNKNOWN' }, 'release/D20: the merge commit recorded as the revision gives no GREEN');
  assert.deepEqual(d20.evidence.integrity.map((f) => f.kind), ['recorded-is-trigger'], 'and the finding names the cause');
  assert.equal(d20.evidence.catalog.complete, false);

  const noTrigger = assembleObservation({ ...base, revision: MERGE, expectedRevision: HEAD });
  assert.deepEqual(noTrigger.observed, { 'x/T1': 'UNKNOWN' });
  assert.deepEqual(noTrigger.evidence.integrity.map((f) => f.kind), ['recorded-not-judged'], 'without a trigger the mismatch is named without its cause');

  const short = assembleObservation({ ...base, revision: 'abc', expectedRevision: 'abc' });
  assert.deepEqual(short.observed, { 'x/T1': 'UNKNOWN' }, 'two equal short ids are not a revision');
  assert.deepEqual(short.evidence.integrity.map((f) => f.kind), ['judged-not-a-revision', 'recorded-not-a-revision']);

  assert.equal(good.schema, 'kaal-testing/observation@1', 'the record keeps its schema and its fields');
  assert.equal(typeof good.evidence.revision, 'string');
}
