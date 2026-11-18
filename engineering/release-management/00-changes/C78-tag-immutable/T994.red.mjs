// Case release/T994 tests: release/C78
import assert from 'node:assert/strict';
import { declared, stageOf, judge } from '../C70-stages-declared-rules/fixtures.mjs';
export const id = 'release/T994';
export const tests = ['release/C78'];
export const title = 'the declared update rule of Publishing passes; a rule the source holds and the stage does not declare, a declared rule the source lacks, and a rule traced to an undeclared control or to a control without an Intent each fail';
function withTag() {
  const f = declared();
  f.controls.push({ id: 'release/CTL15', has: ['release/I43'] });
  stageOf(f, 'Publishing').rules = [{ type: 'update', control: 'release/CTL15', parameters: {} }];
  return f;
}
export async function run() {
  const { judge: j } = await judge();
  assert.equal(j(withTag()).kind, 'pass', 'the declared tag rule is not accepted, so a failure below says nothing');
  const extra = withTag(); extra.rulesets.Publishing.rules.push({ type: 'deletion' });
  const e = j(extra);
  assert.equal(e.kind, 'fail', 'an undeclared rule in the tag ruleset');
  assert.ok(e.findings.some((x) => /deletion/.test(x.message) && /declaration says/.test(x.message)), 'the finding does not name the rule and the declaration');
  const lacks = withTag(); stageOf(lacks, 'Publishing').rules.push({ type: 'non_fast_forward', control: 'release/CTL15', parameters: {} });
  assert.equal(j(lacks).kind, 'fail', 'a declared rule the source lacks');
  const undeclared = withTag(); stageOf(undeclared, 'Publishing').rules[0].control = 'release/CTL99';
  assert.equal(j(undeclared).kind, 'fail', 'a rule traced to an undeclared control');
  const noIntent = withTag(); noIntent.controls.find((c) => c.id === 'release/CTL15').has = [];
  assert.equal(j(noIntent).kind, 'fail', 'a rule traced to a control without an Intent');
  const gone = withTag(); delete stageOf(gone, 'Publishing').rules;
  assert.equal(j(gone).kind, 'fail', 'a stage that declares no rules for its tag ruleset');
  const moved = withTag(); moved.rulesets.Publishing.rules = [];
  assert.equal(j(moved).kind, 'fail', 'a source without the update rule');
}
