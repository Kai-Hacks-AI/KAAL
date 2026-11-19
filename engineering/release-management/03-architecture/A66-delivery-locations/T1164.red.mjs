// Case release/T1164 tests: release/A66
import assert from 'node:assert/strict';
import { loadSrc, wire, ev, install } from './fixtures.mjs';
export const id = 'release/T1164';
export const tests = ['release/A66'];
export const title = 'a missing or malformed declaration fails closed: no WIRE target, and no fallback list';
export async function run() {
  const { parseLocations, readLocations } = await loadSrc('delivery/locations.mjs');
  const { decideFinal, wireTarget } = await loadSrc('promotion-raise/final-step.mjs');
  const { judge } = await loadSrc('wiring/wire-judge.mjs');
  const w = (r) => ({ locations: [{ root: r, wirable: true }] });
  const malformed = [
    ['no locations', {}], ['empty list', { locations: [] }], ['not an object', null],
    ['root with a slash', w('.github/workflows')], ['root dot-dot', w('..')], ['root dot', w('.')], ['absolute root', w('/etc')], ['empty root', w('')],
    ['duplicate root', { locations: [{ root: '.a', wirable: true }, { root: '.a', wirable: false }] }],
    ['wirable not a boolean', { locations: [{ root: '.a', wirable: 'yes' }] }],
    ['no wirable at all', { locations: [{ root: '.a' }] }],
  ];
  for (const [name, j] of malformed) assert.throws(() => parseLocations(j), name + ' is refused');
  assert.throws(() => readLocations('/nonexistent/delivery-locations.json'));
  const broken = () => { throw new Error('unreadable'); };
  const d = decideFinal(ev({ base: 'wire/the-copy', body: wire('.github/x.yml') }), broken);
  assert.equal(d.action, 'skip');
  assert.equal(d.reason, 'no-delivery-declaration');
  assert.equal(judge({ ...install('.github/x.yml'), read: broken }), false);
  assert.equal(wireTarget(wire('.github/x.yml'), undefined), null, 'no locations, no target: there is no list of its own');
}
