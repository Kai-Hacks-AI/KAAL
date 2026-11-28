// Case controls/T1734 tests: controls/F231
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const FILE = join(repo, 'packages/kaal-controls/test/lib/judge-lane.mjs');
export const id = 'controls/T1734';
export const tests = ['controls/F231'];
export const title = 'the lane judge accepts a registered Case only when it is observed RED by its assertion, and names every other deviation';
const CASE = '02-requirements/F9-x/T9.test.mjs';
const t = (name, actual) => ({ id: `f.test.mjs > ${name}`, file: 'f.test.mjs', actual });
const report = (tests, problems = []) => ({ schema: 'kaal-testing/run-report@1', tests, diagnostics: [], execution: { complete: problems.length === 0, files: ['f.test.mjs'], problems } });
const register = (...ids) => ({ schema: 'kaal-testing/expected-failures@1', expected: ids.map((i) => ({ id: `f.test.mjs > ${i}`, reference: 'controls/C900' })) });
const OPEN = [{ id: 'controls/C900', open: true, cases: [CASE] }];
export async function run() {
  assert.ok(existsSync(FILE), 'test/lib/judge-lane.mjs is absent');
  assert.doesNotMatch(readFileSync(FILE, 'utf8'), /from ['"]node:/, 'the judge imports a platform module, so it is not pure');
  const { judgeLane } = await import(pathToFileURL(FILE).href);
  const judge = (tests, reg, extra = {}) => judgeLane({ report: report(tests, extra.problems), register: reg, changes: extra.changes ?? OPEN });
  const ok = judge([t(CASE, 'RED'), t('other', 'GREEN')], register(CASE));
  assert.equal(ok.ok, true); assert.deepEqual(ok.held, [`f.test.mjs > ${CASE}`]); assert.deepEqual(ok.findings, []);
  assert.equal(judge([t('other', 'GREEN')], register()).ok, true, 'an empty register and all GREEN passes');
  const finds = (r) => r.findings;
  assert.deepEqual(finds(judge([t(CASE, 'GREEN')], register(CASE))), [`green:f.test.mjs > ${CASE}`], 'a PLAN Case that passes early is found');
  assert.deepEqual(finds(judge([t(CASE, 'UNKNOWN')], register(CASE))), [`error:f.test.mjs > ${CASE}`], 'a PLAN Case that ends before its assertion is found');
  assert.deepEqual(finds(judge([t('other', 'GREEN')], register(CASE))), [`absent:f.test.mjs > ${CASE}`], 'a PLAN Case that did not run is found');
  assert.deepEqual(finds(judge([t(CASE, 'RED'), t('x', 'RED')], register(CASE))), ['red:f.test.mjs > x'], 'an unregistered RED is found');
  assert.deepEqual(finds(judge([t(CASE, 'RED'), t('x', 'UNKNOWN')], register(CASE))), ['unknown:f.test.mjs > x'], 'an unregistered UNKNOWN is found');
  const inc = judge([t(CASE, 'RED')], register(CASE), { problems: [{ file: 'f.test.mjs', kind: 'timeout', detail: 'x' }] });
  assert.equal(inc.ok, false); assert.ok(inc.findings.includes('incomplete'), 'an incomplete run is found');
  const closed = judge([t(CASE, 'RED')], register(CASE), { changes: [{ id: 'controls/C900', open: false, cases: [CASE] }] });
  assert.equal(closed.ok, false); assert.deepEqual(closed.findings, [`closed:f.test.mjs > ${CASE}`], 'an entry whose Change has its ACT is found');
  const gone = judge([t(CASE, 'RED')], register(CASE), { changes: [] });
  assert.deepEqual(gone.findings, [`nochange:f.test.mjs > ${CASE}`], 'an entry naming a Change that does not exist is found');
  const foreign = judge([t(CASE, 'RED')], register(CASE), { changes: [{ id: 'controls/C900', open: true, cases: ['02-requirements/F8-y/T8.test.mjs'] }] });
  assert.deepEqual(foreign.findings, [`foreign:f.test.mjs > ${CASE}`], 'an entry for a Case that does not belong to its Change is found');
  assert.throws(() => judge([t(CASE, 'RED')], { schema: 'kaal-testing/expected-failures@1', expected: [{ id: 'f.test.mjs > ${CASE}' }] }), /reference/, 'an entry with no Change is refused');
}
