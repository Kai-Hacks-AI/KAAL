// Case release/T860 tests: release/CTL10
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T860';
export const tests = ['release/CTL10'];
export const title = 'the finder lists release/CTL10 as a preventive control that has release/I36 and release/I46';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL10');
  assert.ok(c, 'release/CTL10 is not listed');
  assert.equal(c.type, 'preventive');
  assert.deepEqual(c.has, ['release/I36', 'release/I46']);
  assert.equal(c.title, 'approve Integration');
  assert.ok(c.tests.some((t) => t.id === 'release/T860'), 'the control test is not found from the control');
  assert.ok(existsSync(join(RM, '04-controls/CTL10-approve-integration/CTL10.md')), 'CTL10.md is absent');
}
