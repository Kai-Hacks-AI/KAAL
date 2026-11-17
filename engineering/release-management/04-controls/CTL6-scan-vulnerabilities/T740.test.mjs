// Case release/T740 tests: release/CTL6
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T740';
export const tests = ['release/CTL6'];
export const title = 'the finder lists release/CTL6 as a detective control that has release/I31, equal to its draft';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL6');
  assert.ok(c, 'release/CTL6 is not listed');
  assert.equal(c.type, 'detective');
  assert.deepEqual(c.has, ['release/I31']);
  assert.equal(c.title, 'scan Vulnerabilities');
  assert.deepEqual(c.tests.map((t) => t.id), ['release/T740'], 'the control test is not found from the control');
  const draft = readFileSync(join(RM, '00-changes/C57-scan-vulnerabilities/interface.md'), 'utf8').split(/^## Draft of CTL6\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  const real = join(RM, '04-controls/CTL6-scan-vulnerabilities/CTL6.md');
  assert.ok(existsSync(real), 'CTL6.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft}\n`, 'CTL6.md differs from the draft');
}
