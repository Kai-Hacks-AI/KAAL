// Case change/T1564 tests: change/G19
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinOf, record, rec, lib } from '../fixtures.mjs';
export const id = 'change/T1564';
export const tests = ['change/G19'];
export const closes = ['change/G19'];
export const title = 'check Predecessor is UNKNOWN on an unreadable fact, never a pass, and says that no declared prerequisite is not a claim that none exists';
export async function run() {
  const { checkPredecessor } = await lib('check-predecessor');
  const ok = { pinOf, main: [], carried: [rec('change/C2', record('change/C2'))], elsewhere: [], delivered: [] };
  for (const bad of [{ pinOf: undefined }, { main: null }, { carried: 'x' }, { carried: [{ identity: 'change/C2' }] }, { delivered: null }]) {
    const r = await checkPredecessor({ ...ok, ...bad });
    assert.equal(r.kind, 'unknown', JSON.stringify(Object.keys(bad)));
    assert.ok(r.findings.length > 0, 'it names what it cannot read');
  }
  const none = await checkPredecessor(ok);
  assert.equal(none.kind, 'pass');
  assert.match(none.note, /no declared prerequisite/i);
  assert.match(none.note, /not a claim/i);
}
test(id, () => run());
