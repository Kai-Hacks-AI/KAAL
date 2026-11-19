// Case release/T753 tests: release/I32
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T753';
export const tests = ['release/I32'];
export const title = 'release/I32 exists equal to its draft and is answered by three controls: verify Sync detects, approve Sync prevents and review Sync corrects';
export async function run() {
  const real = join(RM, '01-intent/I32-pure-sync-needs-no-review/I32.md');
  assert.ok(existsSync(real), 'I32.md is absent');
  const draft = readFileSync(join(RM, '00-changes/C58-sync-review/interface.md'), 'utf8').split(/^## Draft of I32\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  assert.equal(readFileSync(real, 'utf8'), `${draft}\n`, 'I32.md differs from the draft');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  const owners = out.controls.filter((c) => c.has.includes('release/I32'));
  assert.deepEqual(owners.map((c) => [c.id, c.type]).sort(), [['release/CTL7', 'detective'], ['release/CTL8', 'preventive'], ['release/CTL9', 'corrective']]);
  for (const c of owners) assert.ok(c.tests.length >= 1, `${c.id} has no control test`);
}
