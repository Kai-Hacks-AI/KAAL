// Case release/T1281 tests: release/F82
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
export const id = 'release/T1281';
export const tests = ['release/F82'];
export const title = "a ruleset source whose name is not the one its stage declares fails under the stage's own verify Stages check, for each of the six, and the finding names the ruleset and both names";
export async function run() {
  const { j } = await wellFormed();
  for (const [n, v] of Object.entries(NAMES)) {
    const f = GOOD();
    f.rulesets[n].name = n.toLowerCase();
    const out = j(f);
    assert.equal(out.kind, 'fail', `${n}: the old name is accepted`);
    const own = out.findings.filter((x) => x.message.includes(n.toLowerCase()) && x.message.includes(v));
    assert.ok(own.length >= 1, `${n}: no finding names the ruleset, the name in force and the declared name`);
    f.rulesets[n].name = `${v} `;
    assert.equal(j(f).kind, 'fail', `${n}: a name with a trailing blank is accepted`);
  }
}
