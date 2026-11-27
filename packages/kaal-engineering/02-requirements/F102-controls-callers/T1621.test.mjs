// Case engineering/T1621 tests: engineering/F102
import assert from 'node:assert/strict';
import { entry } from './fixture.mjs';
export const id = 'engineering/T1621';
export const tests = ['engineering/F102'];
export const title = 'each runner reads through hosting-files and calls the controls function its script called';
export async function run() {
  const calls = { 'judge-run.mjs': /judgeMode/, 'check-run.mjs': /checkControls/, 'evidence-run.mjs': /judgeEvidence/, 'registry-run.mjs': /registryAt/ };
  for (const [name, fn] of Object.entries(calls)) {
    const text = entry(name);
    assert.ok(text !== null, `${name} is absent`);
    assert.match(text, /from\s+['"]\.\/hosting-files\.mjs['"]/, `${name} does not read through hosting-files.mjs`);
    assert.match(text, fn, `${name} does not call the controls function`);
    assert.match(text, /kaal-controls\/skills\/kaal-controls\/scripts\//, `${name} does not import the controls Skill`);
  }
}
