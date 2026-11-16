// Case release/T610 tests: release/CTL3
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T610';
export const tests = ['release/CTL3'];
export const title = 'the finder lists release/CTL3 as a preventive control that has release/I28, equal to its draft';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL3');
  assert.ok(c, 'release/CTL3 is not listed');
  assert.equal(c.type, 'preventive');
  assert.deepEqual(c.has, ['release/I28']);
  assert.equal(c.title, 'readiness before pack');
  assert.ok(c.tests.map((t) => t.id).includes('release/T610'), 'the control test is not found from the control');
  const draft = readFileSync(join(RM, '00-changes/C50-readiness/interface.md'), 'utf8').split(/^## Draft of CTL3\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  const real = join(RM, '04-controls/CTL3-readiness-before-pack/CTL3.md');
  assert.ok(existsSync(real), 'CTL3.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft}\n`, 'CTL3.md differs from the draft');
}
