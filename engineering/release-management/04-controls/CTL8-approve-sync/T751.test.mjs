// Case release/T751 tests: release/CTL8
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T751';
export const tests = ['release/CTL8'];
export const title = 'the finder lists release/CTL8 as a preventive control that has release/I32, equal to its draft';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL8');
  assert.ok(c, 'release/CTL8 is not listed');
  assert.equal(c.type, 'preventive');
  assert.deepEqual(c.has, ['release/I32']);
  assert.equal(c.title, 'approve Sync');
  assert.deepEqual(c.tests.map((t) => t.id), ['release/T751'], 'the control test is not found from the control');
  const draft = readFileSync(join(RM, '00-changes/C58-sync-review/interface.md'), 'utf8').split(/^## Draft of CTL8\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  const real = join(RM, '04-controls/CTL8-approve-sync/CTL8.md');
  assert.ok(existsSync(real), 'CTL8.md is absent');
  // The draft predates the mandatory status of controls/C12, so the status line is left out of the comparison.
  assert.equal(readFileSync(real, 'utf8').replace(/^status: .*\n/m, ''), `${draft}\n`, 'CTL8.md differs from the draft');
}
