// Case release/T901 tests: release/C70
import assert from 'node:assert/strict';
import { judge, declared, approval, noForcePush } from './fixtures.mjs';
export const id = 'release/T901';
export const tests = ['release/C70'];
export const title = 'a ruleset that holds two rules, and one that holds three, passes when its stage declares each and traces each to a declared control, whatever the order of the rules in the source';
export async function run() {
  const { judge: j } = await judge();
  const two = j(declared([approval]));
  assert.equal(two.kind, 'pass', `two declared rules are not accepted: ${two.findings.map((f) => f.message).join('; ')}`);
  const three = j(declared([approval, noForcePush]));
  assert.equal(three.kind, 'pass', `three declared rules are not accepted: ${three.findings.map((f) => f.message).join('; ')}`);
  const f = declared([approval, noForcePush]); f.rulesets.Integrating.rules.reverse();
  assert.equal(j(f).kind, 'pass', 'the order of the rules decides the verdict');
}
