// Case release/T750 tests: release/CTL7
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T750';
export const tests = ['release/CTL7'];
export const title = 'the finder lists release/CTL7 as a detective control that has release/I32 and release/I35, equal to its C58 draft with what release/C65 adds';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL7');
  assert.ok(c, 'release/CTL7 is not listed');
  assert.equal(c.type, 'detective');
  assert.deepEqual(c.has, ['release/I32', 'release/I35']); // release/C65 adds release/I35
  assert.equal(c.title, 'verify Sync');
  assert.deepEqual(c.tests.map((t) => t.id), ['release/T750'], 'the control test is not found from the control');
  const draft = readFileSync(join(RM, '00-changes/C58-sync-review/interface.md'), 'utf8').split(/^## Draft of CTL7\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  const real = join(RM, '04-controls/CTL7-verify-sync/CTL7.md');
  assert.ok(existsSync(real), 'CTL7.md is absent');
  // The drafts predate the mandatory status of controls/C12, so the status line is left out of the comparison.
  // release/C65 adds release/I35 to `has` and the Boundary paragraph after the first paragraph
  const section = readFileSync(join(RM, '00-changes/C65-sync-split/interface.md'), 'utf8').split(/^## What the DO adds to the controls$/m)[1].split(/^## The scripts$/m)[0];
  const paragraph = section.match(/^````\n([\s\S]*?)\n````$/m)[1];
  const [head, first, ...rest] = draft.replace('has: [release/I32]', 'has: [release/I32, release/I35]').split('\n\n');
  assert.equal(readFileSync(real, 'utf8').replace(/^status: .*\n/m, ''), `${[head, first, paragraph, ...rest].join('\n\n')}\n`, 'CTL7.md differs from the draft with what release/C65 adds');
}
