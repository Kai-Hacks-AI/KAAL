// Case release/T901 tests: release/C70
import assert from 'node:assert/strict';
import { judge, declared, RULE } from './fixtures.mjs';
export const id = 'release/T901';
export const tests = ['release/C70'];
export const title = 'a declared extra rule that the ruleset lacks, a rule the stage does not declare, a different parameter, an extra rule beyond the declared ones and an unreadable declaration each fail, and a part of Integrating holds its check alone';
export async function run() {
  const { judge: j } = await judge();
  assert.equal(j(declared()).kind, 'pass', 'the declared extra rule is not accepted');
  const lacks = declared(); lacks.rulesets.Integrating.rules.pop();
  assert.equal(j(lacks).kind, 'fail', 'a declared extra rule the ruleset lacks');
  const undeclared = declared(); delete undeclared.stages.stages.find((s) => s.name === 'Integrating').alsoRules;
  assert.equal(j(undeclared).kind, 'fail', 'a rule the stage does not declare');
  const param = declared(); param.rulesets.Integrating.rules[1].parameters.dismiss_stale_reviews_on_push = false;
  assert.equal(j(param).kind, 'fail', 'a different parameter');
  const more = declared(); more.rulesets.Integrating.rules.push({ type: 'non_fast_forward' });
  assert.equal(j(more).kind, 'fail', 'one more rule than declared');
  const order = declared(); order.rulesets.Integrating.rules.reverse();
  assert.equal(j(order).kind, 'fail', 'a reordered pair');
  const bad = declared(); bad.stages.stages.find((s) => s.name === 'Integrating').alsoRules = 'pull_request';
  assert.equal(j(bad).kind, 'fail', 'a declaration that is not a list of rules');
  const part = declared(); part.rulesets.Collecting.rules.push({ ...RULE });
  assert.equal(j(part).kind, 'fail', 'a part of Integrating holding the extra rule');
}
