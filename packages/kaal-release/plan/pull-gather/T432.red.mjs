// Case pull/T432 tests: pull/F52
import assert from 'node:assert/strict';
import { script, authorities, done } from './lib.mjs';
export const id = 'pull/T432';
export const tests = ['pull/F52'];
export const title = 'IN is read from the destination checks at the delivery PR exact head, and unknown until it exists';

export async function run() {
  const { gatherDeliveries } = await script();
  const pr = (sha) => [{ number: 1, base: 'main', head: { ref: 'wire/y', sha } }];
  const inn = (prs, checks, destination) => gatherDeliveries({ heads: [{ ref: 'wire/y', sha: 'h' }], verdicts: [], authorities, prs, checks, destination }).deliveries[0].in;
  const req = { required: ['A', 'B'] };
  assert.equal(inn([], [done('h', 'A'), done('h', 'B')], req), 'UNKNOWN', 'no delivery PR');
  assert.equal(inn(pr('old'), [done('h', 'A'), done('h', 'B')], req), 'UNKNOWN', 'a PR on another head');
  assert.equal(inn(pr('h'), [done('h', 'A'), done('h', 'B')], undefined), 'UNKNOWN', 'unreadable required checks');
  assert.equal(inn(pr('h'), [done('h', 'A'), done('h', 'B')], req), 'PASS');
  assert.equal(inn(pr('h'), [done('h', 'A'), done('h', 'B', 'failure')], req), 'FAIL');
  assert.equal(inn(pr('h'), [done('h', 'A')], req), 'UNKNOWN', 'a required context missing');
  assert.equal(inn(pr('h'), [done('h', 'A'), done('other', 'B')], req), 'UNKNOWN', 'a run on another SHA');
  assert.equal(inn(pr('h'), [{ sha: 'h', name: 'B', status: 'in_progress', conclusion: null }, done('h', 'A')], req), 'UNKNOWN', 'pending');
  // No list of IN checks is stored: another required list gives another result for the same checks.
  assert.equal(inn(pr('h'), [done('h', 'A')], { required: ['A'] }), 'PASS');
}
