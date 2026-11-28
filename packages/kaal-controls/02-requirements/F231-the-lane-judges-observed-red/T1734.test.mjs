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
const t = (name, actual) => ({ id: `f.test.mjs > ${name}`, file: 'f.test.mjs', actual });
const report = (tests, problems = []) => ({ schema: 'kaal-testing/run-report@1', tests, diagnostics: [], execution: { complete: problems.length === 0, files: ['f.test.mjs'], problems } });
const register = (...ids) => ({ schema: 'kaal-testing/expected-failures@1', expected: ids.map((i) => ({ id: `f.test.mjs > ${i}`, reference: 'controls/C900' })) });
export async function run() {
  assert.ok(existsSync(FILE), 'test/lib/judge-lane.mjs is absent');
  assert.doesNotMatch(readFileSync(FILE, 'utf8'), /from ['"]node:/, 'the judge imports a platform module, so it is not pure');
  const { judgeLane } = await import(pathToFileURL(FILE).href);
  const judge = (tests, reg, extra = {}) => judgeLane({ report: report(tests, extra.problems), register: reg, closed: extra.closed ?? [] });
  const ok = judge([t('plan', 'RED'), t('other', 'GREEN')], register('plan'));
  assert.equal(ok.ok, true); assert.deepEqual(ok.held, ['f.test.mjs > plan']); assert.deepEqual(ok.findings, []);
  assert.equal(judge([t('other', 'GREEN')], register()).ok, true, 'an empty register and all GREEN passes');
  const finds = (r) => r.findings;
  assert.deepEqual(finds(judge([t('plan', 'GREEN')], register('plan'))), ['green:f.test.mjs > plan'], 'a PLAN Case that passes early is found');
  assert.deepEqual(finds(judge([t('plan', 'UNKNOWN')], register('plan'))), ['error:f.test.mjs > plan'], 'a PLAN Case that ends before its assertion is found');
  assert.deepEqual(finds(judge([t('other', 'GREEN')], register('plan'))), ['absent:f.test.mjs > plan'], 'a PLAN Case that did not run is found');
  assert.deepEqual(finds(judge([t('plan', 'RED'), t('x', 'RED')], register('plan'))), ['red:f.test.mjs > x'], 'an unregistered RED is found');
  assert.deepEqual(finds(judge([t('plan', 'RED'), t('x', 'UNKNOWN')], register('plan'))), ['unknown:f.test.mjs > x'], 'an unregistered UNKNOWN is found');
  const inc = judge([t('plan', 'RED')], register('plan'), { problems: [{ file: 'f.test.mjs', kind: 'timeout', detail: 'x' }] });
  assert.equal(inc.ok, false); assert.ok(inc.findings.includes('incomplete'), 'an incomplete run is found');
  const closed = judge([t('plan', 'RED')], register('plan'), { closed: ['controls/C900'] });
  assert.equal(closed.ok, false); assert.deepEqual(closed.findings, ['closed:f.test.mjs > plan'], 'an entry whose Change has its ACT is found');
  assert.throws(() => judge([t('plan', 'RED')], { schema: 'kaal-testing/expected-failures@1', expected: [{ id: 'f.test.mjs > plan' }] }), /reference/, 'an entry with no Change is refused');
}
