// Case pull/T39 tests: pull/F38
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T39';
export const tests = ['pull/F38'];
export const title = 'a tie for the highest value, or a qualifier without a valid value, is judged: next names no collector and the candidates, and an invalid value is not read as a value';

export async function run() {
  const fx = await import(pathToFileURL(join(repo, 'packages/kaal-release/test/pull/fixtures.mjs')).href);
  const walk = (cols) => fx.walkCollectors({ collectors: cols.map((c) => fx.good(c.name)) }, fx.declaration({ collectors: cols }));
  const judged = (r) => { assert.equal(r.next.collector, null, 'a judged choice named a collector'); assert.ok(/judg/i.test(r.next.reason ?? ''), 'the reason does not say the choice is judged'); return r.next.judged; };

  // A tie for the highest value: the tied candidates are named, whichever is listed first.
  assert.deepEqual(judged(await walk([{ name: 'col-a', value: 2 }, { name: 'col-b', value: 2 }, { name: 'col-c', value: 1 }])), ['col-a', 'col-b'], 'the tied candidates were not named');
  // A lower tie below a unique highest does not make it judged.
  assert.equal((await walk([{ name: 'col-a', value: 1 }, { name: 'col-b', value: 1 }, { name: 'col-c', value: 3 }])).next.collector, 'col-c', 'a lower tie made next judged');
  // A qualifier without a value: all qualifiers are named.
  assert.deepEqual(judged(await walk([{ name: 'col-a', value: 5 }, { name: 'col-b' }])), ['col-a', 'col-b'], 'a missing value did not make next judged');
  // Invalid values count as no value; a non-integer is named in problems.
  for (const bad of [0, -1, 1.5, '2', null]) {
    const r = await walk([{ name: 'col-a', value: 5 }, { name: 'col-b', value: bad }]);
    assert.deepEqual(judged(r), ['col-a', 'col-b'], `the value ${JSON.stringify(bad)} was read as a value`);
  }
  assert.ok((await walk([{ name: 'col-a', value: 5 }, { name: 'col-b', value: 1.5 }])).problems.some((p) => /col-b/.test(p) && /value/.test(p)), 'a non-integer value is not named in problems');
  // Qualification itself is untouched by the judged outcome.
  const r = await walk([{ name: 'col-a', value: 2 }, { name: 'col-b', value: 2 }]);
  assert.deepEqual(r.qualifiers, ['col-a', 'col-b'], 'a tie changed who qualifies');
}
