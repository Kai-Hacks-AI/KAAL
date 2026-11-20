// Case release/T1185 tests: F78
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
export const id = 'release/T1185';
export const tests = ['release/F78'];
export const title = 'the checker as a lone copy beside the reader and the declaration checks a mix; without them it says cannot check, passes the gate and reports no pass of the rule';
export async function run() {
  const mixed = '.githooks/pre-push\0src/y.txt\0';
  const lone = mkdtempSync(join(tmpdir(), 'c101-lone-'));
  copyFileSync(join(repo, CHECKER), join(lone, 'check.mjs'));
  const withFiles = mkdtempSync(join(tmpdir(), 'c101-beside-'));
  copyFileSync(join(repo, CHECKER), join(withFiles, 'check.mjs'));
  copyFileSync(join(repo, READER), join(withFiles, 'kaal-delivery-locations.mjs'));
  copyFileSync(join(repo, DECL), join(withFiles, 'kaal-delivery-locations.json'));
  const checked = spawnSync(process.execPath, [join(withFiles, 'check.mjs')], { input: mixed, encoding: 'utf8' });
  assert.equal(checked.status, 0, 'the gate passes this change');
  assert.doesNotMatch(checked.stdout, /cannot check/, `the lone copy could not check: ${checked.stdout}`);
  assert.match(checked.stdout, /delivery travels apart from solution: src\/y\.txt is not a delivery path/);
  const blind = spawnSync(process.execPath, [join(lone, 'check.mjs')], { input: mixed, encoding: 'utf8' });
  assert.equal(blind.status, 0, 'a lone copy without the reader still passes the gate');
  assert.match(blind.stdout, /detective \(not gating\): cannot check/);
  assert.doesNotMatch(blind.stdout, /delivery travels apart from solution: src/, 'without the reader nothing is reported as checked');
}
