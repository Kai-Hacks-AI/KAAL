// Case release/T1004 tests: release/C79
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const CHANGE = join(RM, '00-changes/C79-derived-judge-facts');
export const id = 'release/T1004';
export const tests = ['release/C79'];
export const title = 'from the real sources, a removed setting, a forged check and a dropped control each make the judge fail naming the stage, and the unmutated copy passes';
export async function run() {
  assert.ok(existsSync(join(CHANGE, 'derive.mjs')), 'derive.mjs is absent');
  const { real, judge } = await import(join(CHANGE, 'derive.mjs'));
  assert.equal(judge(real()).kind, 'pass', 'the unmutated copy does not pass');
  const status = (f, name) => f.rulesets[name].rules.find((r) => r.type === 'required_status_checks').parameters;
  const failing = (facts, check) => judge(facts).findings.filter((x) => x.check === check);
  const a = real();
  delete status(a, 'Integrating').strict_required_status_checks_policy;
  assert.ok(failing(a, 'verify Stages (Integrating)').some((x) => /strict_required_status_checks_policy/.test(x.message)), 'a removed setting is not reported');
  const b = real();
  status(b, 'Promoting').required_status_checks[0].integration_id = 1;
  assert.ok(failing(b, 'verify Stages (Promoting)').some((x) => /required checks/.test(x.message)), 'a forged check is not reported');
  const c = real();
  c.controls = c.controls.filter((x) => x.id !== 'release/CTL1');
  assert.ok(failing(c, 'verify Stages (Integrating)').some((x) => /release\/CTL1/.test(x.message)), 'a dropped control is not reported');
}
