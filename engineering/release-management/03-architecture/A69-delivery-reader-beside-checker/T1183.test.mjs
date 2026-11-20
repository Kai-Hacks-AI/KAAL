// Case release/T1183 tests: A69
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
export const id = 'release/T1183';
export const tests = ['release/A69'];
export const title = 'the Architecture addresses release/F78 and names the two wrappers and the two files beside the checker, equal to its draft';
export async function run() {
  const real = join(RM, '03-architecture/A69-delivery-reader-beside-checker/A69.md');
  assert.ok(existsSync(real), 'A69.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft('A69.md')}\n`, 'A69.md differs from the draft');
  const t = readFileSync(real, 'utf8');
  assert.match(t, /addresses: \[release\/F78\]/);
  for (const n of ['change-isolation.sh', 'push-check.sh', 'kaal-delivery-locations.mjs', 'kaal-delivery-locations.json']) assert.ok(t.includes(n), `A69 does not name ${n}`);
}
