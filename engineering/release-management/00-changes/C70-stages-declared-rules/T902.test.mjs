// Case release/T902 tests: release/C70
import assert from 'node:assert/strict';
import { judge, declared, approval, noForcePush, stageOf } from './fixtures.mjs';
export const id = 'release/T902';
export const tests = ['release/C70'];
export const title = 'a rule in the source that the stage does not declare, a declared rule the source lacks, a setting that differs from the declared one or that the declaration does not hold, and a check that is not declared or is missing each fail, and a part of Integrating holds its own check alone';
export async function run() {
  const { judge: j } = await judge();
  assert.equal(j(declared([approval])).kind, 'pass', 'the declared structure is not accepted, so a failure below says nothing');
  const undeclared = declared([approval]); delete stageOf(undeclared, 'Integrating').rules[1];
  stageOf(undeclared, 'Integrating').rules = stageOf(undeclared, 'Integrating').rules.filter(Boolean);
  const u = j(undeclared);
  assert.equal(u.kind, 'fail', 'an undeclared rule in the source');
  assert.ok(u.findings.some((x) => /pull_request/.test(x.message) && /declaration says/.test(x.message)), 'the finding does not name the rule and the declaration');
  const lacks = declared([approval]); lacks.rulesets.Integrating.rules.pop();
  assert.equal(j(lacks).kind, 'fail', 'a declared rule the source lacks');
  const extraCheck = declared(); extraCheck.rulesets.Promoting.rules[0].parameters.required_status_checks.push({ context: 'Guard', integration_id: 15368 });
  assert.equal(j(extraCheck).kind, 'fail', 'a check the stage does not declare');
  const missingCheck = declared(); missingCheck.rulesets.Promoting.rules[0].parameters.required_status_checks.pop();
  assert.equal(j(missingCheck).kind, 'fail', 'a declared check the source lacks');
  const partExtra = declared(); partExtra.rulesets.Collecting.rules.push({ type: 'non_fast_forward' });
  assert.equal(j(partExtra).kind, 'fail', 'an undeclared rule on a part of Integrating');
  const setting = declared([approval]); setting.rulesets.Integrating.rules[1].parameters.dismiss_stale_reviews_on_push = false;
  const sf = j(setting);
  assert.equal(sf.kind, 'fail', 'a setting that differs from the declared one');
  assert.ok(sf.findings.some((x) => /dismiss_stale_reviews_on_push/.test(x.message)), 'the finding does not name the setting');
  const untraced = declared([approval]); untraced.rulesets.Integrating.rules[1].parameters.require_code_owner_review = true;
  assert.equal(j(untraced).kind, 'fail', 'a setting in the source that the declaration does not hold');
  const create = declared(); create.rulesets.Promoting.rules[0].parameters.do_not_enforce_on_create = true;
  assert.equal(j(create).kind, 'fail', 'a status-check setting that differs from the declared one');
  const more = declared([approval, noForcePush]); more.rulesets.Integrating.rules.push({ type: 'deletion' });
  assert.equal(j(more).kind, 'fail', 'one more rule than declared');
}
