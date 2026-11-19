// Case release/T1177 tests: release/CTL22
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
export const id = 'release/T1177';
export const tests = ['release/CTL22'];
export const title = 'the judge says PASS for a fast-forward, an equal tip and a new main, FAIL for a rewrite and a deletion, UNKNOWN when it cannot tell';
export async function run() {
  const { judge } = await load();
  const A = 'a'.repeat(40), B = 'b'.repeat(40), Z = '0'.repeat(40);
  assert.equal(judge({ before: A, after: B, forward: true }).verdict, 'PASS', 'a fast-forward must pass');
  assert.equal(judge({ before: A, after: A, forward: true }).verdict, 'PASS', 'an equal tip must pass');
  assert.equal(judge({ before: Z, after: A }).verdict, 'PASS', 'a new main must pass');
  assert.equal(judge({ before: A, after: B, forward: false }).verdict, 'FAIL', 'a rewrite must fail');
  assert.equal(judge({ before: A, after: Z }).verdict, 'FAIL', 'a deletion must fail');
  assert.equal(judge({ before: A, after: '' }).verdict, 'FAIL', 'a missing after must fail');
  assert.equal(judge({ before: A, after: B, forward: undefined }).verdict, 'UNKNOWN', 'an untold history never passes');
}
