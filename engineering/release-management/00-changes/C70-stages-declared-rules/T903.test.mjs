// Case release/T903 tests: release/C70
import assert from 'node:assert/strict';
import { judge, declared, approval, stageOf } from './fixtures.mjs';
export const id = 'release/T903';
export const tests = ['release/C70'];
export const title = 'a rule or a check traced to no control, to a control that is not declared or to a control that has no Intent fails, and so do a declaration that is not a list and a missing declaration';
export async function run() {
  const { judge: j } = await judge();
  assert.equal(j(declared([approval])).kind, 'pass', 'the declared structure is not accepted, so a failure below says nothing');
  const ghost = declared([approval]); stageOf(ghost, 'Integrating').rules[1].control = 'release/CTL99';
  const g = j(ghost);
  assert.equal(g.kind, 'fail', 'a rule traced to a control that is not declared');
  assert.ok(g.findings.some((x) => /release\/CTL99/.test(x.message) && /not a declared control/.test(x.message)), 'the finding does not name the control');
  const none = declared([approval]); delete stageOf(none, 'Integrating').rules[1].control;
  assert.equal(j(none).kind, 'fail', 'a rule traced to no control');
  const check = declared(); stageOf(check, 'Promoting').rules[0].checks[1].control = 'release/CTL99';
  assert.equal(j(check).kind, 'fail', 'a check traced to a control that is not declared');
  const undeclared = declared(); undeclared.controls = undeclared.controls.filter((c) => c.id !== 'release/CTL1');
  assert.equal(j(undeclared).kind, 'fail', 'checks traced to a control the checkout does not declare');
  const withoutIntent = declared([approval]); withoutIntent.controls.find((c) => c.id === 'release/CTL10').has = [];
  assert.equal(j(withoutIntent).kind, 'fail', 'a rule traced to a control that has no Intent');
  const bad = declared(); stageOf(bad, 'Integrating').rules = 'required_status_checks';
  assert.equal(j(bad).kind, 'fail', 'a declaration that is not a list');
  const missing = declared(); delete stageOf(missing, 'Promoting').rules;
  assert.equal(j(missing).kind, 'fail', 'a stage that declares no rules');
}
