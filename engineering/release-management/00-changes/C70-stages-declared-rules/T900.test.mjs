// Case release/T900 tests: release/C70
import assert from 'node:assert/strict';
import { judge, declared } from './fixtures.mjs';
export const id = 'release/T900';
export const tests = ['release/C70'];
export const title = 'a ruleset whose source holds exactly the one rule its stage declares, with its checks traced to declared controls, passes, whatever the order of its checks';
export async function run() {
  const { judge: j } = await judge();
  const out = j(declared());
  assert.equal(out.kind, 'pass', `the declared rules are not accepted: ${out.findings.map((f) => f.message).join('; ')}`);
  const f = declared(); f.rulesets.Promoting.rules[0].parameters.required_status_checks.reverse();
  assert.equal(j(f).kind, 'pass', 'the order of the checks decides the verdict');
}
