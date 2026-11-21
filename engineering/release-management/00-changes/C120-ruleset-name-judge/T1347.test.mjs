// Case release/T1347 tests: release/I27
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
export const id = 'release/T1347';
export const tests = ['release/I27'];
export const title = 'the judge compares a source with the name its stage declares and holds no name in code: declaring another name with the source renamed to match passes, declaring it alone fails';
export async function run() {
  const { j } = await wellFormed();
  for (const n of Object.keys(NAMES)) {
    const f = GOOD();
    stageOf(f, n).ruleset = '99 - other';
    assert.equal(j(f).kind, 'fail', `${n}: a declared name that differs from the source passes`);
    f.rulesets[n].name = '99 - other';
    assert.equal(j(f).kind, 'pass', `${n}: the judge holds a name in code, the declared name is not decisive`);
  }
}
