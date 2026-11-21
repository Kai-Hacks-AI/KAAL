// Case release/T1349 tests: release/I27
import assert from 'node:assert/strict';
import { GOOD, judge } from '../C35-stages/helper.mjs';
const NAMES = { Integrating: '20 - integrating', Hotfixing: '21 - hotfixing', Wiring: '22 - wiring', Collecting: '23 - collecting', Promoting: '30 - promoting', Publishing: '40 - publishing' };
const stageOf = (f, n) => f.stages.stages.find((s) => s.name === n) ?? f.stages.stages.find((s) => s.name === 'Integrating').parts.find((p) => p.name === n);
const wellFormed = async () => {
  const { judge: j } = await judge();
  const f = GOOD();
  for (const [n, v] of Object.entries(NAMES)) assert.equal(stageOf(f, n).ruleset, v, `${n} does not declare the ruleset name ${v}`);
  for (const [n, v] of Object.entries(NAMES)) assert.equal(f.rulesets[n].name, v, `the source of ${n} is named ${f.rulesets[n].name}`);
  assert.equal(j(f).kind, 'pass', 'the real sources do not pass under their declared names');
  return { j, f };
};
export const id = 'release/T1349';
export const tests = ['release/I27'];
export const title = 'the declared names change nothing else the judge decides: a departure in rules, refs, target or bypass still fails under the same check';
export async function run() {
  const { j } = await wellFormed();
  const f = GOOD();
  f.rulesets.Collecting.bypass_actors = [{ actor_id: 1, actor_type: 'Team', bypass_mode: 'always' }];
  f.rulesets.Promoting.rules = [];
  const out = j(f);
  assert.equal(out.kind, 'fail');
  assert.ok(out.checks.includes('verify Stages (Collecting)'), 'a bypass actor on Collecting is not found');
  assert.ok(out.checks.includes('verify Stages (Promoting)'), 'an emptied Promoting is not found');
  assert.ok(!out.checks.includes('verify Stages (Wiring)'), 'a ruleset that is right is reported');
}
