// Case pull/T24 tests: pull/F22
import assert from 'node:assert/strict';
import { collector, declaration, facts, landed, lifecycle, open, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T24';
export const tests = ['pull/F22'];
export const title = 'outstanding work never disappears from the evidence: an open piece keeps its Change in the collector and is not a landed phase, so a collector with an open PLAN, DO or ACT cannot qualify';
const decl = declaration({ collectors: [{ name: 'col-a' }] });
const one = async (pieces) => statusOf(await walkCollectors(facts({ collectors: [collector('col-a')], pieces }), decl), 'col-a');
export async function run() {
  // a Change whose only pieces are open is still an undelivered Change: another complete Change cannot hide it
  const hidden = await one([...lifecycle('col-a'), open('#70', 'PLAN', 'c/other', 'col-a')]);
  assert.equal(hidden.status, 'does not qualify', 'an open PLAN was ignored and the collector qualified');
  assert.ok(hidden.changes.some((c) => c.id === 'c/other' && c.complete === false), 'the Change with only an open piece is not in the evidence');
  assert.ok(hidden.missing.some((m) => /#70/.test(m) && /open/.test(m)), 'the open piece is not named');
  // the same for each phase, with the phase otherwise landed nowhere
  for (const type of ['PLAN', 'DO', 'ACT']) {
    const r = await one([...lifecycle('col-a').filter((p) => p.type !== type), open('#71', type, 'c/col-a', 'col-a')]);
    assert.equal(r.status, 'does not qualify', `an open ${type} counted as landed or was ignored`);
    assert.ok(r.missing.some((m) => m.includes(type) && m.includes('#71')), `the open ${type} is not named`);
  }
  // an open piece next to the whole lifecycle landed still keeps it from qualifying until it lands
  const extra = await one([...lifecycle('col-a'), open('#72', 'ACT', 'c/col-a', 'col-a')]);
  assert.notEqual(extra.status, 'qualifies', 'a collector with outstanding work qualified');
  // an open piece that names no Change cannot be placed: not judged, never ignored
  const nameless = await one([...lifecycle('col-a'), open('#73', 'DO', undefined, 'col-a')]);
  assert.equal(nameless.status, 'not judged');
  assert.ok(nameless.missing.some((m) => /#73/.test(m)));
  // and once the piece has landed the collector qualifies again
  const done = await one([...lifecycle('col-a'), landed('#72', 'ACT', 'c/col-a', 'col-a', '2026-11-12T09:00:00Z')]);
  assert.equal(done.status, 'qualifies');
}
