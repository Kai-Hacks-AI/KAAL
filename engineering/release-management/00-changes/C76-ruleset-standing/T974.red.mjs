// Case release/T974 tests: release/C76
import assert from 'node:assert/strict';
import { declared, stageOf, judge } from '../C70-stages-declared-rules/fixtures.mjs';
export const id = 'release/T974';
export const tests = ['release/C76'];
export const title = 'a ruleset that is not active, whose bypass list is not empty, whose stage declares no standing or a standing that traces to no control or to a control without an Intent, each fails verify Stages, and the declared standing passes';
const STANDING = { control: 'release/CTL13', enforcement: 'active', bypass: [] };
function withStanding() {
  const f = declared();
  f.controls = f.controls.filter((c) => c.id !== 'release/CTL13'); f.controls.push({ id: 'release/CTL13', has: ['release/I41'] });
  for (const n of ['Integrating', 'Promoting', 'Publishing']) stageOf(f, n).standing = { ...STANDING };
  for (const p of stageOf(f, 'Integrating').parts) p.standing = { ...STANDING };
  return f;
}
export async function run() {
  const { judge: j } = await judge();
  assert.equal(j(withStanding()).kind, 'pass', 'the declared standing is not accepted, so a failure below says nothing');
  const off = withStanding(); off.rulesets.Collecting.enforcement = 'evaluate';
  const o = j(off);
  assert.equal(o.kind, 'fail', 'an evaluate-only ruleset');
  assert.ok(o.findings.some((x) => /enforcement/.test(x.message)), 'the finding does not name the setting');
  const disabled = withStanding(); disabled.rulesets.Promoting.enforcement = 'disabled';
  assert.equal(j(disabled).kind, 'fail', 'a disabled ruleset');
  const bypass = withStanding(); bypass.rulesets.Integrating.bypass_actors = [{ actor_id: 5, actor_type: 'RepositoryRole', bypass_mode: 'always' }];
  assert.equal(j(bypass).kind, 'fail', 'a bypass actor');
  const wide = withStanding(); wide.rulesets.Hotfixing.conditions.ref_name.include.push('refs/heads/other/**');
  assert.equal(j(wide).kind, 'fail', 'refs beyond the stage');
  const none = withStanding(); delete none.stages.stages.find((s) => s.name === 'Integrating').parts.find((p) => p.name === 'Wiring').standing;
  assert.equal(j(none).kind, 'fail', 'a stage that declares no standing');
  const undeclared = withStanding(); stageOf(undeclared, 'Promoting').standing.control = 'release/CTL99';
  assert.equal(j(undeclared).kind, 'fail', 'a standing traced to an undeclared control');
  const noIntent = withStanding(); noIntent.controls.find((c) => c.id === 'release/CTL13').has = [];
  assert.equal(j(noIntent).kind, 'fail', 'a standing traced to a control without an Intent');
  const pub = withStanding(); pub.rulesets.Publishing.enforcement = 'evaluate';
  assert.equal(j(pub).kind, 'fail', 'an evaluate-only tag ruleset');
}
