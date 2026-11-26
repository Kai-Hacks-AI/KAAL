// Case change/T1570 tests: change/G18
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinOf, record, entry, succeeds, load } from './fixtures.mjs';
export const id = 'change/T1570';
export const tests = ['change/G18'];
export const closes = ['change/G18'];
export const title = 'a matching pin is not delivery, and delivery is not a pin: the reader reports edges and findings only, never satisfaction';
export async function run() {
  const readSuccession = await load();
  const a = record('release/C1');
  const b = record('change/C2', succeeds(entry('release/C1', pinOf(a))));
  const r = readSuccession([{ identity: 'release/C1', text: a }, { identity: 'change/C2', text: b }], { pinOf });
  assert.deepEqual(Object.keys(r.edges[0]).sort(), ['because', 'from', 'pin', 'to'], 'an edge states identity, binding and reason, and nothing about delivery');
  assert.ok(!JSON.stringify(r).match(/deliver|satisf|met|ready/i), 'the result names no delivery or satisfaction');
  // A predecessor present under other bytes is stale however delivered it may be: the binding is broken, nothing else is claimed.
  const edited = a + 'a wording correction\n';
  const s = readSuccession([{ identity: 'release/C1', text: edited }, { identity: 'change/C2', text: b }], { pinOf });
  assert.deepEqual(s.findings.map((f) => f.kind), ['stale']);
  assert.deepEqual(s.edges, []);
}
test(id, () => run());
