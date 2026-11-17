// Case release/T761 tests: release/C59
import assert from 'node:assert/strict';
import { judge, declared, EXTRA } from './fixtures.mjs';
export const id = 'release/T761';
export const tests = ['release/C59'];
export const title = 'a declared extra check that the ruleset lacks, an extra check the stage does not declare, a reordered pair and a wrong extra check each fail, as do an unreadable declaration and the extra check on a stage that declares none';
export async function run() {
  const { judge: j } = await judge();
  assert.equal(j(declared()).kind, 'pass', 'the declared extra check is not accepted');
  const lacks = declared(); lacks.rulesets.Promoting.rules[0].parameters.required_status_checks.pop();
  assert.equal(j(lacks).kind, 'fail', 'a declared extra check the ruleset lacks');
  const undeclared = declared(); delete undeclared.stages.stages.find((s) => s.name === 'Promoting').also;
  assert.equal(j(undeclared).kind, 'fail', 'an extra check the stage does not declare');
  const order = declared(); order.rulesets.Promoting.rules[0].parameters.required_status_checks.reverse();
  assert.equal(j(order).kind, 'fail', 'a reordered pair');
  const wrong = declared(); wrong.rulesets.Promoting.rules[0].parameters.required_status_checks[1].context = 'Guard';
  assert.equal(j(wrong).kind, 'fail', 'a wrong extra check');
  const more = declared(); more.rulesets.Promoting.rules[0].parameters.required_status_checks.push({ context: 'Guard', integration_id: 15368 });
  assert.equal(j(more).kind, 'fail', 'one more check than declared');
  const bad = declared(); bad.stages.stages.find((s) => s.name === 'Promoting').also = EXTRA;
  assert.equal(j(bad).kind, 'fail', 'a declaration that is not a list');
}
