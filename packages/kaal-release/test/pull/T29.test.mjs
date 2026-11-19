// Case pull/T29 tests: pull/F29, pull/F30
import assert from 'node:assert/strict';
import { declaration, evidence, facts, good, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T29';
export const tests = ['pull/F29', 'pull/F30'];
export const title = 'an absent or empty evidence declaration is not a vacuous pass, and provenance is not evidence: pull-request fields in the facts change nothing';
export async function run() {
  const cases = [
    ['no evidence', { evidence: undefined }, /evidence/],
    ['no plan', { evidence: evidence({ plan: [] }) }, /plan/i],
    ['no do', { evidence: evidence({ do: undefined }) }, /\bdo\b/i],
    ['no cases', { evidence: evidence({ cases: undefined }) }, /cases?/i],
    ['no act', { evidence: evidence({ act: { files: '^plan/', headings: [] } }) }, /act|heading/i],
  ];
  for (const [label, over, named] of cases) {
    const result = await walkCollectors(facts(), declaration(over));
    assert.deepEqual(result.qualifiers, [], `${label}: a collector qualified on a vacuous declaration`);
    assert.ok(result.problems.some((p) => named.test(p)), `${label}: the missing declaration is not reported`);
    for (const name of ['col-a', 'col-b', 'col-c']) {
      const entry = statusOf(result, name);
      assert.equal(entry.status, 'not judged', `${label}: ${name} is ${entry.status}`);
      assert.ok(entry.missing.some((m) => named.test(m)), `${label}: ${name} does not name the missing declaration`);
    }
  }
  // provenance: pull requests, titles, trailers and reviews in the facts change nothing
  const plain = await walkCollectors(facts(), declaration());
  const noisy = facts({
    pieces: [{ ref: '#1', type: 'PLAN', change: 'x/C1', into: 'col-a', state: 'open' }, { ref: '#2', type: 'ACT', state: 'dropped', into: 'col-b' }],
    deliveries: [{ collector: 'col-a', delivered: 'col-a-head', landedAt: '2026-11-12T09:00:00Z' }],
    collectors: [good('col-a', { pulls: [{ number: 1, title: 'DO: nothing', trailer: 'Driven-by: none' }] }), good('col-b'), good('col-c')],
  });
  assert.equal(JSON.stringify(await walkCollectors(noisy, declaration())), JSON.stringify(plain), 'pull-request fields in the facts changed the result');
  assert.ok(!/#\d+|Driven-by|pull request/i.test(JSON.stringify(plain)), 'the output speaks of pull requests');
}
