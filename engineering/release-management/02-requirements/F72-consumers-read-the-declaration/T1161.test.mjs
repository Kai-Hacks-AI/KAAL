// Case release/T1161 tests: release/F72
import assert from 'node:assert/strict';
import { loadSrc, install } from '../../03-architecture/A67-delivery-locations/fixtures.mjs';
export const id = 'release/T1161';
export const tests = ['release/F72'];
export const title = 'the install judge takes a copy under every declared wirable location and refuses the rest';
export async function run() {
  const { judge } = await loadSrc('wiring/wire-judge.mjs');
  for (const t of ['.github/workflows/a.yml', '.githooks/pre-push', '.kaal/config/guard/Branching.md']) assert.equal(judge(install(t)), true, t + ' is judged right');
  for (const t of ['engineering/x.yml', '.agents/skills/x/SKILL.md', '.kaalx/y', '.kaal/../engineering/x', '/.kaal/x']) assert.equal(judge(install(t)), false, t + ' is judged wrong');
}
