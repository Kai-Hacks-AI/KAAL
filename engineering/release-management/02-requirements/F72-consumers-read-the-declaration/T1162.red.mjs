// Case release/T1162 tests: release/F72
import assert from 'node:assert/strict';
import { loadSrc, wire, ev, install } from '../../03-architecture/A67-delivery-locations/fixtures.mjs';
export const id = 'release/T1162';
export const tests = ['release/F72'];
export const title = 'adding or removing a location in the declaration changes both consumers and no consumer code';
export async function run() {
  const { parseLocations } = await loadSrc('delivery/locations.mjs');
  const { decideFinal } = await loadSrc('promotion-raise/final-step.mjs');
  const { judge } = await loadSrc('wiring/wire-judge.mjs');
  const base = 'wire/the-copy';
  const agents = '.agents/skills/kaal-guard/SKILL.md';
  const added = () => parseLocations({ locations: [{ root: '.github', wirable: true }, { root: '.agents', what: 'deployed skills', wirable: true }] });
  assert.equal(decideFinal(ev({ base, body: wire(agents) }), added).action, 'raise');
  assert.equal(judge({ ...install(agents), read: added }), true);
  const removed = () => parseLocations({ locations: [{ root: '.githooks', wirable: true }] });
  assert.equal(decideFinal(ev({ base, body: wire('.github/x.yml') }), removed).reason, 'malformed-wire');
  assert.equal(judge({ ...install('.github/x.yml'), read: removed }), false);
  const declaredNotWirable = () => parseLocations({ locations: [{ root: '.kaal', wirable: false }] });
  assert.equal(decideFinal(ev({ base, body: wire('.kaal/x.md') }), declaredNotWirable).reason, 'malformed-wire');
  assert.equal(judge({ ...install('.kaal/x.md'), read: declaredNotWirable }), false);
}
