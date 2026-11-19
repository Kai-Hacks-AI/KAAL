// Case release/T1175 tests: release/F77
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const MOD = join(RM, '05-src/history/verify-history.mjs');
const load = () => import(pathToFileURL(MOD).href);
const draft = (name) => readFileSync(join(RM, '00-changes/C99-verify-main-history/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
const git = (cwd, ...a) => execFileSync('git', ['-C', cwd, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' }).trim();
// a scratch repository whose main moved forward twice: returns { dir, c1, c2 }
const scratch = () => { const dir = mkdtempSync(join(tmpdir(), 'c99-')); git(dir, 'init', '-q', '-b', 'main'); git(dir, 'commit', '-q', '--allow-empty', '-m', 'one'); const c1 = git(dir, 'rev-parse', 'HEAD'); git(dir, 'commit', '-q', '--allow-empty', '-m', 'two'); return { dir, c1, c2: git(dir, 'rev-parse', 'HEAD') }; };
const cli = (dir, before, after) => spawnSync(process.execPath, [MOD, '--root', dir, '--before', before, '--after', after], { encoding: 'utf8' });
export const id = 'release/T1175';
export const tests = ['release/F77'];
export const title = 'the Requirement serves release/I54 and states the FAIL, PASS and UNKNOWN cases, equal to its draft';
export async function run() {
  const real = join(RM, '02-requirements/F77-verify-history/F77.md');
  assert.ok(existsSync(real), 'F77.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft('F77.md')}\n`, 'F77.md differs from the draft');
  const t = readFileSync(real, 'utf8');
  assert.match(t, /serves: \[release\/I54\]/);
  for (const w of ['FAIL', 'PASS', 'UNKNOWN', 'ancestor', 'deleted']) assert.match(t, new RegExp(w));
}
