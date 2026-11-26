// Case release/T1280 tests: release/F82
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
export const id = 'release/T1280';
export const tests = ['release/F82'];
export const title = 'the six ruleset sources are named by their stage number, 20 integrating, 21 hotfixing, 22 wiring, 23 collecting, 30 promoting and 40 publishing, and stages.json declares each of those names beside its stage';
export async function run() {
  await wellFormed();
}
