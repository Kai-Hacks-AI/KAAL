// Case release/T752 tests: release/CTL9
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T752';
export const tests = ['release/CTL9'];
export const title = 'the finder lists release/CTL9 as a corrective control that has release/I32 and release/I33, equal to its C58 draft with what release/C60 adds';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL9');
  assert.ok(c, 'release/CTL9 is not listed');
  assert.equal(c.type, 'corrective');
  assert.deepEqual(c.has, ['release/I32', 'release/I33']); // release/C60 adds release/I33
  assert.equal(c.title, 'review Sync');
  assert.deepEqual(c.tests.map((t) => t.id), ['release/T752'], 'the control test is not found from the control');
  const draft = readFileSync(join(RM, '00-changes/C58-sync-review/interface.md'), 'utf8').split(/^## Draft of CTL9\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  const real = join(RM, '04-controls/CTL9-review-sync/CTL9.md');
  assert.ok(existsSync(real), 'CTL9.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft.replace('has: [release/I32]', 'has: [release/I32, release/I33]')}\n`, 'CTL9.md differs from the draft with what release/C60 adds');
}
