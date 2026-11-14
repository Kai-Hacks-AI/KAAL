// Case pull/T39 tests: pull/F38
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T39';
export const tests = ['pull/F38'];
export const title = 'a tie, a missing or invalid value, size or unit, and different units are judged: next names no collector and the candidates, and a missing size is never defaulted';

export async function run() {
  const fx = await import(pathToFileURL(join(repo, 'packages/kaal-release/test/pull/fixtures.mjs')).href);
  const col = (name, over = {}) => ({ name, value: 4, size: 2, unit: 'Cases added', ...over });
  const walk = (cols) => fx.walkCollectors({ collectors: cols.map((c) => fx.good(c.name)) }, fx.declaration({ collectors: cols }));
  const judged = (r, why) => {
    assert.equal(r.next.collector, null, `${why}: a judged choice named a collector`);
    assert.ok(/judg/i.test(r.next.reason ?? ''), `${why}: the reason does not say the choice is judged`);
    return r.next.judged;
  };

  // A tie for the highest density (2/1 = 4/2 exactly); the lower one is not a candidate.
  assert.deepEqual(judged(await walk([col('col-a', { value: 2, size: 1 }), col('col-b', { value: 4, size: 2 }), col('col-c', { value: 1, size: 1 })]), 'a tie'), ['col-a', 'col-b'], 'the tied candidates were not named');
  // A lower tie below a unique highest does not make it judged.
  assert.equal((await walk([col('col-a', { value: 1, size: 1 }), col('col-b', { value: 1, size: 1 }), col('col-c', { value: 3, size: 1 })])).next.collector, 'col-c', 'a lower tie made next judged');
  // A missing value, size or unit is judged and names every qualifier; size is never defaulted to 1.
  for (const missing of ['value', 'size', 'unit']) {
    const b = col('col-b'); delete b[missing];
    assert.deepEqual(judged(await walk([col('col-a', { value: 99 }), b]), `a missing ${missing}`), ['col-a', 'col-b'], `a missing ${missing} was defaulted`);
  }
  // Different units are not compared, even for an IFPUG and a COSMIC count.
  assert.deepEqual(judged(await walk([col('col-a', { unit: 'IFPUG FP 4.3' }), col('col-b', { unit: 'COSMIC CFP' })]), 'different units'), ['col-a', 'col-b'], 'ratios of different units were compared');
  // Invalid fields give no valid density and are named in problems.
  for (const [field, bad] of [['value', 0], ['value', 1.5], ['size', 0], ['size', '3'], ['size', 2.5], ['unit', ''], ['unit', 7]]) {
    const r = await walk([col('col-a'), col('col-b', { [field]: bad })]);
    judged(r, `${field} ${JSON.stringify(bad)}`);
    assert.ok(r.problems.some((p) => /col-b/.test(p) && new RegExp(field).test(p)), `${field} ${JSON.stringify(bad)} is not named in problems`);
  }
  // A tie does not change who qualifies.
  const r = await walk([col('col-a'), col('col-b')]);
  assert.deepEqual(r.qualifiers, ['col-a', 'col-b'], 'a tie changed who qualifies');
}
