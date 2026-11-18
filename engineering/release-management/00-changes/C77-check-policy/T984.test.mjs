// Case release/T984 tests: release/C77
import assert from 'node:assert/strict';
import { declared, stageOf, judge } from '../C70-stages-declared-rules/fixtures.mjs';
export const id = 'release/T984';
export const tests = ['release/C77'];
export const title = 'a status-check setting without a control of its own, with a control that is undeclared or has no Intent, or with a value other than the declared one, each fails verify Stages, and the declared check policy passes';
const SETTINGS = ['strict_required_status_checks_policy', 'do_not_enforce_on_create'];
function withPolicy() {
  const f = declared();
  f.controls = f.controls.filter((c) => c.id !== 'release/CTL14'); f.controls.push({ id: 'release/CTL14', has: ['release/I42'] });
  const rules = [stageOf(f, 'Integrating'), stageOf(f, 'Promoting'), ...stageOf(f, 'Integrating').parts].map((s) => s.rules.find((r) => r.type === 'required_status_checks'));
  for (const r of rules) r.settingControls = { strict_required_status_checks_policy: 'release/CTL14', do_not_enforce_on_create: 'release/CTL14' };
  return f;
}
export async function run() {
  const { judge: j } = await judge();
  assert.equal(j(withPolicy()).kind, 'pass', 'the declared check policy is not accepted, so a failure below says nothing');
  for (const s of SETTINGS) {
    const missing = withPolicy(); delete stageOf(missing, 'Promoting').rules[0].settingControls[s];
    const m = j(missing);
    assert.equal(m.kind, 'fail', 'a setting with no control of its own: ' + s);
    assert.ok(m.findings.some((x) => x.message.includes(s)), 'the finding does not name ' + s);
  }
  const undeclared = withPolicy(); stageOf(undeclared, 'Integrating').rules[0].settingControls.do_not_enforce_on_create = 'release/CTL99';
  assert.equal(j(undeclared).kind, 'fail', 'a setting traced to an undeclared control');
  const noIntent = withPolicy(); noIntent.controls.find((c) => c.id === 'release/CTL14').has = [];
  assert.equal(j(noIntent).kind, 'fail', 'a setting traced to a control without an Intent');
  const strict = withPolicy(); strict.rulesets.Collecting.rules[0].parameters.strict_required_status_checks_policy = true;
  assert.equal(j(strict).kind, 'fail', 'up to date required');
  const create = withPolicy(); create.rulesets.Promoting.rules[0].parameters.do_not_enforce_on_create = true;
  assert.equal(j(create).kind, 'fail', 'the default branch can be created without its checks');
  const extra = withPolicy(); stageOf(extra, 'Promoting').rules[0].settingControls.require_something = 'release/CTL14';
  assert.equal(j(extra).kind, 'fail', 'a control for a setting that is not declared');
}
