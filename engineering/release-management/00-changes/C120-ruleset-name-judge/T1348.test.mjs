// Case release/T1348 tests: release/I27
import assert from 'node:assert/strict';
import { GOOD, judge } from '../C35-stages/helper.mjs';
const NAMES = { Integrating: 'integrating', Hotfixing: 'hotfixing', Wiring: 'wiring', Collecting: 'collecting', Promoting: 'promoting', Publishing: 'publishing' };
const stageOf = (f, n) => f.stages.stages.find((s) => s.name === n) ?? f.stages.stages.find((s) => s.name === 'Integrating').parts.find((p) => p.name === n);
const wellFormed = async () => {
  const { judge: j } = await judge();
  const f = GOOD();
  for (const [n, v] of Object.entries(NAMES)) assert.equal(stageOf(f, n).ruleset, v, `${n} does not declare the ruleset name ${v}`);
  for (const [n, v] of Object.entries(NAMES)) assert.equal(f.rulesets[n].name, v, `the source of ${n} is named ${f.rulesets[n].name}`);
  assert.equal(j(f).kind, 'pass', 'the real sources do not pass under their declared names');
  return { j, f };
};
export const id = 'release/T1348';
export const tests = ['release/I27'];
export const title = 'a stage that declares no ruleset name, or one that is not a string, fails closed under its own verify Stages check, for each of the six';
export async function run() {
  const { j } = await wellFormed();
  for (const n of Object.keys(NAMES)) {
    for (const bad of [undefined, '', 30, null, ['promoting']]) {
      const f = GOOD();
      if (bad === undefined) delete stageOf(f, n).ruleset; else stageOf(f, n).ruleset = bad;
      const out = j(f);
      assert.equal(out.kind, 'fail', `${n}: a ruleset name of ${JSON.stringify(bad)} passes`);
      assert.ok(out.findings.some((x) => x.message.includes(n)), `${n}: no finding names the stage`);
    }
  }
}
