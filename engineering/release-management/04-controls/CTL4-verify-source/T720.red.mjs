// Case release/T720 tests: release/CTL4
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T720';
export const tests = ['release/CTL4'];
export const title = 'the finder lists release/CTL4 as a detective control that has release/I29, equal to its draft';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL4');
  assert.ok(c, 'release/CTL4 is not listed');
  assert.equal(c.type, 'detective');
  assert.deepEqual(c.has, ['release/I29']);
  assert.equal(c.title, 'verify Source');
  assert.ok(c.tests.map((t) => t.id).includes('release/T720'), 'the control test is not found from the control');
  const draft = readFileSync(join(RM, '00-changes/C55-verify-source/interface.md'), 'utf8').split(/^## Draft of CTL4\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  const real = join(RM, '04-controls/CTL4-verify-source/CTL4.md');
  assert.ok(existsSync(real), 'CTL4.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft}\n`, 'CTL4.md differs from the draft');
}
