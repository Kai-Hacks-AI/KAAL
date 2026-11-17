// Case release/T741 tests: release/I31
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T741';
export const tests = ['release/I31'];
export const title = 'release/I31 exists equal to its draft and is answered by a control: release/CTL6 has it, and its control test answers for it';
export async function run() {
  const real = join(RM, '01-intent/I31-known-advisories-on-main/I31.md');
  assert.ok(existsSync(real), 'I31.md is absent');
  const draft = readFileSync(join(RM, '00-changes/C57-scan-vulnerabilities/interface.md'), 'utf8').split(/^## Draft of I31\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  assert.equal(readFileSync(real, 'utf8'), `${draft}\n`, 'I31.md differs from the draft');
  const out = JSON.parse(execFileSync(process.execPath, [join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs'), RM], { encoding: 'utf8' }));
  const owners = out.controls.filter((c) => c.has.includes('release/I31'));
  assert.deepEqual(owners.map((c) => c.id), ['release/CTL6'], 'no control has release/I31');
  assert.equal(owners[0].type, 'detective');
  assert.ok(owners[0].tests.length >= 1, 'the control has no control test');
}
