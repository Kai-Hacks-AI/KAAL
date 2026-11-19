// Case release/T1182 tests: F78
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C101-delivery-control/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
const git = (cwd, ...a) => execFileSync('git', ['-C', cwd, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' }).trim();
const CHECKER = 'engineering/change-isolation/check.mjs';
const READER = 'engineering/release-management/05-src/delivery/locations.mjs';
const DECL = 'engineering/release-management/03-architecture/A67-delivery-locations/delivery-locations.json';
const put = (dir, rel, from) => { mkdirSync(dirname(join(dir, rel)), { recursive: true }); copyFileSync(join(repo, from ?? rel), join(dir, rel)); };
export const id = 'release/T1182';
export const tests = ['release/F78'];
export const title = 'the Requirement says the delivery rule checks in every shape its checker runs in and says cannot check otherwise, equal to its draft';
export async function run() {
  const real = join(RM, '02-requirements/F78-delivery-rule-checks/F78.md');
  assert.ok(existsSync(real), 'F78.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft('F78.md')}\n`, 'F78.md differs from the draft');
  const t = readFileSync(real, 'utf8');
  assert.match(t, /serves: \[release\/I53\]/);
  assert.match(t, /cannot check/);
}
