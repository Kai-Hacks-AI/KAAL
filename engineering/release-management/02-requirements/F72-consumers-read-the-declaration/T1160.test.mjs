// Case release/T1160 tests: release/F72
import assert from 'node:assert/strict';
import { loadSrc, wire, ev } from '../../03-architecture/A67-delivery-locations/fixtures.mjs';
export const id = 'release/T1160';
export const tests = ['release/F72'];
export const title = 'the merge-event classifier takes a WIRE target under every declared wirable location and refuses the rest';
export async function run() {
  const { decideFinal } = await loadSrc('promotion-raise/final-step.mjs');
  const base = 'wire/the-copy';
  for (const t of ['.github/workflows/a.yml', '.githooks/pre-push', '.kaal/config/guard/Branching.md']) {
    const d = decideFinal(ev({ base, body: wire(t) }));
    assert.equal(d.action, 'raise', t + ' is a WIRE target');
    assert.equal(d.title, 'PROMOTION: WIRE ' + t);
  }
  for (const t of ['engineering/x.yml', '.agents/skills/x/SKILL.md', '.kaalx/y', '.kaal', '.github', '.kaal/../engineering/x', '/.kaal/x', '.kaal/a b', 'kaal/x']) {
    const d = decideFinal(ev({ base, body: wire(t) }));
    assert.equal(d.action, 'skip', t + ' is not a WIRE target');
    assert.equal(d.reason, 'malformed-wire', t);
  }
}
