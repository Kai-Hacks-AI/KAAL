// Case release/T1180 tests: release/CTL22
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
const draft = (name) => readFileSync(join(RM, '00-changes/C100-verify-main-history/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
const git = (cwd, ...a) => execFileSync('git', ['-C', cwd, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' }).trim();
// a scratch repository whose main moved forward twice: returns { dir, c1, c2 }
const scratch = () => { const dir = mkdtempSync(join(tmpdir(), 'c99-')); git(dir, 'init', '-q', '-b', 'main'); git(dir, 'commit', '-q', '--allow-empty', '-m', 'one'); const c1 = git(dir, 'rev-parse', 'HEAD'); git(dir, 'commit', '-q', '--allow-empty', '-m', 'two'); return { dir, c1, c2: git(dir, 'rev-parse', 'HEAD') }; };
const cli = (dir, before, after) => spawnSync(process.execPath, [MOD, '--root', dir, '--before', before, '--after', after], { encoding: 'utf8' });
export const id = 'release/T1180';
export const tests = ['release/CTL22'];
export const title = 'the control declares its own minimum evidence with two failure kinds, and the controls checker accepts the declaration';
export async function run() {
  const real = join(RM, '04-controls/CTL22-verify-history/CTL22.md');
  assert.ok(existsSync(real), 'CTL22.md is absent');
  assert.match(readFileSync(real, 'utf8'), /^evidence: \[fixture:2, real:1, provoked:2:fail\]$/m);
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  const c = out.controls.find((x) => x.id === 'release/CTL22');
  assert.ok(c, 'release/CTL22 is not listed');
  assert.deepEqual(out.refused, []);
  const chk = spawnSync(process.execPath, [CHECK, RM], { encoding: 'utf8' });
  assert.doesNotMatch(chk.stdout + chk.stderr, /CTL22[^\n]*(invalid|evidence)/i, 'the controls checker rejects the declaration');
}
