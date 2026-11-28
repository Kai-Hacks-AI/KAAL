// Case controls/T1740 tests: controls/F237
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
export const id = 'controls/T1740';
export const tests = ['controls/F237'];
export const title = 'a check may report measures next to its findings; they are carried unchanged into the result, the log line and the record, invalid ones are dropped and named, and no measure ever changes a verdict';
const boundary = { x: 'real', run: 'r1', sha: 'abc' };
const api = { name: 'api-calls', value: 42, unit: 'calls', better: 'lower' };
const size = { name: 'baseline', value: 7, unit: 'findings' };
export async function run() {
  const { runControl } = await import(pathToFileURL(join(scripts, 'adapter.mjs')).href);
  const go = (answer, mode = 'preventive') => runControl({ id: 'c/CTL1', mode, check: () => answer, input: {}, boundary });
  const bare = (r) => { const { measures, measureProblems, ...rest } = r; return { ...rest, log: { ...rest.log, measures: undefined }, record: rest.record && { ...rest.record, measures: undefined } }; };
  for (const [findings, mode] of [[[], 'preventive'], [['a'], 'preventive'], [['a'], 'detective']]) {
    const plain = await go(findings, mode);
    const withMeasures = await go({ findings, measures: [api, size] }, mode);
    assert.deepEqual(withMeasures.measures, [api, size], 'the measures are carried unchanged');
    assert.deepEqual(withMeasures.log.measures, [api, size], 'the log line carries them');
    assert.deepEqual(withMeasures.record.measures, [api, size], 'the record carries them');
    assert.deepEqual(bare(withMeasures), bare(plain), 'a measure changes neither the verdict, blocked, the findings nor anything else');
    assert.equal('measures' in plain, false); assert.equal('measureProblems' in plain, false);
  }
  const bad = await go({ findings: [], measures: [api, { ...api }, { name: '', value: 1, unit: 'x' }, { name: 'n', value: Number.NaN, unit: 'x' }, { name: 'i', value: Infinity, unit: 'x' }, { name: 'u', value: 1, unit: '' }, { name: 'b', value: 1, unit: 'x', better: 'bigger' }, 'text', null] });
  assert.deepEqual(bad.measures, [api], 'only the valid measure is carried, duplicates dropped after the first');
  assert.equal(bad.measureProblems.length, 8, 'each dropped measure is named');
  assert.equal(bad.verdict, 'PASS', 'invalid measures never turn a PASS into anything else');
  const none = await go({ findings: [], measures: 'not a list' });
  assert.equal(none.verdict, 'PASS'); assert.ok(none.measureProblems.length > 0);
  const thrown = await runControl({ id: 'c/CTL1', mode: 'preventive', check: () => { throw new Error('x'); }, input: {}, boundary });
  assert.equal(thrown.verdict, 'UNKNOWN'); assert.equal('measures' in thrown, false, 'a check that threw reports no measures');
  const listed = await go([]);
  assert.equal('measures' in listed.record, false, 'a check that reports no measure leaves no entry in the record, never an empty or zero one');
  assert.equal('measures' in listed.log, false);
  const allBad = await go({ findings: [], measures: [{ name: 'n', value: Number.NaN, unit: 'x' }] });
  assert.equal('measures' in allBad, false, 'a measure that was dropped leaves no zero behind');
  assert.equal('measures' in allBad.record, false);
  const notFindings = await go({ measures: [api] });
  assert.equal(notFindings.verdict, 'UNKNOWN', 'an object without findings is not an answer');
}
