// Case release/T850 tests: release/I35
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T850';
export const tests = ['release/I35'];
export const title = 'release/I35 exists equal to its draft, is held by release/CTL7 and release/CTL8 beside their other Intents, and both controls carry the drafted Boundary paragraph';
const draft = (name) => readFileSync(join(RM, '00-changes/C65-sync-split/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name}\\.md$`, 'm'))[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
export async function run() {
  const real = join(RM, '01-intent/I35-sync-review-token-boundary/I35.md');
  assert.ok(existsSync(real), 'I35.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft('I35')}\n`, 'I35.md differs from the draft');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const holders = out.controls.filter((c) => c.has.includes('release/I35')).map((c) => c.id).sort();
  assert.deepEqual(holders, ['release/CTL7', 'release/CTL8'], 'CTL7 and CTL8 hold release/I35');
  assert.deepEqual(out.controls.find((c) => c.id === 'release/CTL7').has, ['release/I32', 'release/I35']);
  assert.deepEqual(out.controls.find((c) => c.id === 'release/CTL8').has, ['release/I32', 'release/I33', 'release/I35']);
  const section = readFileSync(join(RM, '00-changes/C65-sync-split/interface.md'), 'utf8').split(/^## What the DO adds to the controls$/m)[1].split(/^## The scripts$/m)[0];
  const [seven, eight] = [...section.matchAll(/^````\n([\s\S]*?)\n````$/gm)].map((m) => m[1]);
  assert.ok(readFileSync(join(RM, '04-controls/CTL7-verify-sync/CTL7.md'), 'utf8').includes(seven), 'CTL7.md carries the Boundary paragraph');
  assert.ok(readFileSync(join(RM, '04-controls/CTL8-approve-sync/CTL8.md'), 'utf8').includes(eight), 'CTL8.md carries the Boundary paragraph');
  assert.ok(!out.controls.some((c) => c.id === 'release/CTL10' && c.title.includes('Sync')), 'no new control');
}
