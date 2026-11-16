// Case release/T541 tests: release/I27
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T541';
export const tests = ['release/I27'];
export const title = 'release/I27 is answered by a control: release/CTL1 has it, and the control test answers for it';
export async function run() {
  assert.ok(existsSync(join(RM, '01-intent/I27-stages-intact/I27.md')), 'I27 is absent');
  assert.match(readFileSync(join(RM, '01-intent/I27-stages-intact/I27.md'), 'utf8'), /^id: release\/I27$/m);
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  const owners = out.controls.filter((c) => c.has.includes('release/I27'));
  assert.deepEqual(owners.map((c) => c.id), ['release/CTL1'], 'no control has release/I27');
  assert.equal(owners[0].type, 'detective');
  assert.ok(owners[0].tests.length >= 1, 'the control has no control test');
}
