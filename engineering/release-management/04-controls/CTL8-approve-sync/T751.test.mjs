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
export const title = 'the finder lists release/CTL8 as a preventive control that has release/I32, release/I33 and release/I35, equal to its C58 draft with what release/C60 and release/C65 add';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL8');
  assert.ok(c, 'release/CTL8 is not listed');
  assert.equal(c.type, 'preventive');
  assert.deepEqual(c.has, ['release/I32', 'release/I33', 'release/I35']); // release/C60 adds release/I33, release/C65 release/I35
  assert.equal(c.title, 'approve Sync');
  assert.deepEqual(c.tests.map((t) => t.id), ['release/T751'], 'the control test is not found from the control');
  const draft = readFileSync(join(RM, '00-changes/C58-sync-review/interface.md'), 'utf8').split(/^## Draft of CTL8\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  const real = join(RM, '04-controls/CTL8-approve-sync/CTL8.md');
  assert.ok(existsSync(real), 'CTL8.md is absent');
  // release/C60 adds release/I33 to `has` and the Settings paragraph after the first paragraph
  const paragraph = readFileSync(join(RM, '00-changes/C60-sync-approval/interface.md'), 'utf8').match(/after its first:\n\n````\n([\s\S]*?)\n````/)[1];
  // release/C65 adds release/I35 to `has` and the Boundary paragraph after the Settings paragraph
  const section = readFileSync(join(RM, '00-changes/C65-sync-split/interface.md'), 'utf8').split(/^## What the DO adds to the controls$/m)[1].split(/^## The scripts$/m)[0];
  const boundary = [...section.matchAll(/^````\n([\s\S]*?)\n````$/gm)][1][1];
  const [head, first, ...rest] = draft.replace('has: [release/I32]', 'has: [release/I32, release/I33, release/I35]').split('\n\n');
  const expected = [head, first, paragraph, boundary, ...rest].join('\n\n');
  assert.equal(readFileSync(real, 'utf8'), `${expected}\n`, 'CTL8.md differs from the draft with what release/C60 and release/C65 add');
}
