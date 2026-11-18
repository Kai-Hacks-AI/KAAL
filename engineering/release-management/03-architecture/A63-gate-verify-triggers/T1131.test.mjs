// Case release/T1131 tests: release/A63
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C91-gate-verify-triggers/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1131';
export const tests = ['release/A63'];
export const title = 'release/A63 addresses release/F68 and states the source, the declaration and the merge_group path, equal to its draft';
export async function run() {
  const real = join(RM, '03-architecture/A63-gate-verify-triggers/A63.md');
  assert.ok(existsSync(real), 'A63.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('A63.md')}\n`, 'A63.md differs from the draft');
  assert.match(t, /addresses: \[release\/F68\]/);
  assert.match(t, /merge_group/);
  assert.match(t, /promoting\.json/);
}
