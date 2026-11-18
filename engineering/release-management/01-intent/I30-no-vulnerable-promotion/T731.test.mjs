// Case release/T731 tests: release/I30
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T731';
export const tests = ['release/I30'];
export const title = 'release/I30 is equal to its draft and answered by a control: release/CTL5 has it, and the control test answers for it';
export async function run() {
  const real = join(RM, '01-intent/I30-no-vulnerable-promotion/I30.md');
  assert.ok(existsSync(real), 'I30.md is absent');
  const draft = readFileSync(join(RM, '00-changes/C56-analyze-gate/interface.md'), 'utf8').split(/^## Draft of I30\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  assert.equal(readFileSync(real, 'utf8'), `${draft}\n`, 'I30.md differs from the draft');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  const owners = out.controls.filter((c) => c.has.includes('release/I30'));
  assert.deepEqual(owners.map((c) => c.id), ['release/CTL5'], 'no control has release/I30');
  assert.equal(owners[0].type, 'preventive');
  assert.ok(owners[0].tests.length >= 1, 'the control has no control test');
}
