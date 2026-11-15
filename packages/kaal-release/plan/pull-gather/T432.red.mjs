// Case pull/T432 tests: pull/F52
import assert from 'node:assert/strict';
import { script, classes } from './lib.mjs';
export const id = 'pull/T432';
export const tests = ['pull/F52'];
export const title = 'nothing is invented: KAAL out follows the report at the same head, facts are not guessed';

export async function run() {
  const { gatherDeliveries } = await script();
  const facts = (report) => ({ heads: [{ ref: 'kaal/a/b', sha: 'h' }], checks: [], classes, report });
  const out = (report) => gatherDeliveries(facts(report)).deliveries[0].out;
  assert.equal(out({ qualifiers: [{ name: 'kaal/a/b', sha: 'h' }], rejected: [] }), 'PASS');
  assert.equal(out({ qualifiers: [], rejected: [{ name: 'kaal/a/b', sha: 'h' }] }), 'FAIL');
  assert.equal(out(undefined), 'UNKNOWN', 'no report');
  assert.equal(out({ qualifiers: [{ name: 'kaal/a/b', sha: 'old' }], rejected: [] }), 'UNKNOWN', 'a report for another head');
  const d = gatherDeliveries(facts(undefined)).deliveries[0];
  for (const f of ['value', 'size', 'unit']) assert.equal(d[f], undefined, `${f} was invented`);
  const bad = gatherDeliveries({ heads: 'nope', checks: [], classes });
  assert.deepEqual(bad.deliveries, []);
  assert.ok(bad.findings.length > 0, 'a finding was not given');
  const input = facts(undefined);
  const copy = JSON.stringify(input);
  gatherDeliveries(input);
  assert.equal(JSON.stringify(input), copy, 'the input was changed');
}
