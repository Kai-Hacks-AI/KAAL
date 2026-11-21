// Case release/T1346 tests: release/I27
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
export const id = 'release/T1346';
export const tests = ['release/I27'];
export const title = "a ruleset source whose name differs from the one its stage declares fails under the stage's own verify Stages check, for each of the six, and the finding names the ruleset and both names";
export async function run() {
  const { j } = await wellFormed();
  for (const [n, v] of Object.entries(NAMES)) {
    const f = GOOD();
    f.rulesets[n].name = `${v}-x`;
    const out = j(f);
    assert.equal(out.kind, 'fail', `${n}: another name is accepted`);
    assert.ok(out.findings.some((x) => x.message.includes(`${v}-x`) && x.message.includes(v)), `${n}: no finding names the name in force and the declared name`);
    f.rulesets[n].name = `${v} `;
    assert.equal(j(f).kind, 'fail', `${n}: a name with a trailing blank is accepted`);
  }
}
