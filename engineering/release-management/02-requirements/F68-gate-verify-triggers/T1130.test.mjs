// Case release/T1130 tests: release/F68
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C91-gate-verify-triggers/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1130';
export const tests = ['release/F68'];
export const title = 'release/F68 serves release/I50 and states the requirement of the check in the promoting ruleset, equal to its draft';
export async function run() {
  const real = join(RM, '02-requirements/F68-gate-verify-triggers/F68.md');
  assert.ok(existsSync(real), 'F68.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('F68.md')}\n`, 'F68.md differs from the draft');
  assert.match(t, /serves: \[release\/I50\]/);
  assert.match(t, /merge queue entry/);
  assert.match(t, /never a name kept by hand/);
}
