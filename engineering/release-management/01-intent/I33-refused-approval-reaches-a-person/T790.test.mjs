// Case release/T790 tests: release/I33
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T790';
export const tests = ['release/I33'];
export const title = 'release/I33 exists equal to its draft, is held by release/CTL8 and release/CTL9 beside release/I32, and CTL8 states its two settings and when it is Running';
export async function run() {
  const real = join(RM, '01-intent/I33-refused-approval-reaches-a-person/I33.md');
  assert.ok(existsSync(real), 'I33.md is absent');
  const draft = readFileSync(join(RM, '00-changes/C60-sync-approval/interface.md'), 'utf8').split(/^## Draft of I33\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  assert.equal(readFileSync(real, 'utf8'), `${draft}\n`, 'I33.md differs from the draft');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  const holders = out.controls.filter((c) => c.has.includes('release/I33')).map((c) => c.id).sort();
  assert.deepEqual(holders, ['release/CTL8', 'release/CTL9'], 'CTL8 and CTL9 hold release/I33');
  for (const c of out.controls.filter((c) => ['release/CTL8', 'release/CTL9'].includes(c.id))) assert.ok(c.has.includes('release/I32'), `${c.id} keeps release/I32`);
  assert.ok(!out.controls.some((c) => c.id === 'release/CTL10' && c.title.includes('Sync')), 'no new control for the settings');
  const ctl8 = readFileSync(join(RM, '04-controls/CTL8-approve-sync/CTL8.md'), 'utf8');
  const paragraph = readFileSync(join(RM, '00-changes/C60-sync-approval/interface.md'), 'utf8').match(/after its first:\n\n````\n([\s\S]*?)\n````/)[1];
  assert.ok(ctl8.includes(paragraph), 'CTL8.md carries the drafted Settings paragraph');
}
