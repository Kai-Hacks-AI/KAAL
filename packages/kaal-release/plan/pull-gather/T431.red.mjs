// Case pull/T431 tests: pull/F51
import assert from 'node:assert/strict';
import { script, ok, classes } from './lib.mjs';
export const id = 'pull/T431';
export const tests = ['pull/F51'];
export const title = 'a side passes only on completed successes at the exact head; UNKNOWN never passes';

export async function run() {
  const { gatherDeliveries } = await script();
  const side = (checks, cls = classes, ref = 'hotfix/x') => gatherDeliveries({ heads: [{ ref, sha: 'h' }], checks, classes: cls }).deliveries[0];
  assert.equal(side([ok('h', 'Hotfix'), ok('h', 'Admission')]).out, 'PASS');
  assert.equal(side([ok('h', 'Hotfix'), ok('h', 'Admission')]).in, 'PASS');
  assert.equal(side([{ sha: 'h', name: 'Hotfix', status: 'completed', conclusion: 'failure' }]).out, 'FAIL');
  assert.equal(side([]).out, 'UNKNOWN', 'a missing context');
  assert.equal(side([{ sha: 'h', name: 'Hotfix', status: 'in_progress', conclusion: null }]).out, 'UNKNOWN', 'a pending run');
  assert.equal(side([ok('other', 'Hotfix')]).out, 'UNKNOWN', 'a run on another SHA');
  assert.equal(side([{ sha: 'h', name: 'Hotfix', status: 'completed', conclusion: 'held' }]).out, 'UNKNOWN', 'held');
  assert.equal(side([ok('h', 'Hotfix')], { HOTFIX: { out: [], in: [] } }).out, 'UNKNOWN', 'no declared contexts');
  assert.equal(side([ok('h', 'Hotfix')], {}).in, 'UNKNOWN', 'a class that is not declared');
}
