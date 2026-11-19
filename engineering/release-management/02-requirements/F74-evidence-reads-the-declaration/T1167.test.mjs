// Case release/T1167 tests: release/F74
import assert from 'node:assert/strict';
import { loadSrc, text } from '../../03-architecture/A67-delivery-locations/fixtures.mjs';
export const id = 'release/T1167';
export const tests = ['release/F74'];
export const title = 'Pull Promotion counts a delivery location as DO evidence, read from the declaration';
export async function run() {
  const { withDelivery } = await loadSrc('pull-promotion/delivery-evidence.mjs');
  const { parseLocations, readLocations } = await loadSrc('delivery/locations.mjs');
  const base = JSON.parse(text('05-src/pull-promotion/declaration.json'));
  const before = JSON.stringify(base);
  const hit = (d, p) => d.evidence.do.some((re) => new RegExp(re).test(p));
  const mine = withDelivery(base, parseLocations({ locations: [{ root: '.agents', wirable: true }], files: [{ path: 'lock.json', wirable: false }] }));
  assert.equal(JSON.stringify(base), before, 'the declaration it is given is not changed');
  assert.ok(hit(mine, '.agents/skills/x/SKILL.md'), 'a path under a declared root counts');
  assert.ok(hit(mine, 'lock.json'), 'a declared file counts');
  assert.ok(hit(mine, 'packages/x/src/y.mjs'), 'the solution roots of Pull Promotion still count');
  assert.ok(!hit(mine, '.github/workflows/a.yml'), 'a root the declaration does not name does not count');
  assert.ok(!hit(mine, '.agents/plan/x/y.md'), 'a plan path is not DO evidence');
  assert.ok(!hit(mine, 'lock.jsonx'), 'a file is matched whole');
  const real = withDelivery(base, readLocations());
  for (const p of ['.github/workflows/a.yml', '.githooks/pre-push', '.kaal/config/guard/x.md', '.agents/skills/x/SKILL.md', '.claude/skills/x/SKILL.md', 'package.json', 'package-lock.json']) assert.ok(hit(real, p), p + ' counts');
}
