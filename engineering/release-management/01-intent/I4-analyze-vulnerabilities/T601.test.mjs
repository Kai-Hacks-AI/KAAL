// Case release/T601 tests: release/I4
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T601';
export const tests = ['release/I4'];
export const title = 'release/I4 is answered by a control: release/CTL2 has it, and the control test answers for it';
export async function run() {
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  const owners = out.controls.filter((c) => c.has.includes('release/I4'));
  assert.deepEqual(owners.map((c) => c.id), ['release/CTL2'], 'no control has release/I4');
  assert.equal(owners[0].type, 'detective');
  assert.ok(owners[0].tests.length >= 1, 'the control has no control test');
}
