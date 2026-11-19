// Case release/T1178 tests: release/CTL22
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
export const id = 'release/T1178';
export const tests = ['release/CTL22'];
export const title = 'the command line, run on real scratch repositories, passes a fast-forward and fails a force-push, a deletion; a commit it cannot read is UNKNOWN';
export async function run() {
  const { dir, c1, c2 } = scratch();
  assert.equal(cli(dir, c1, c2).status, 0, 'a fast-forward must pass');
  assert.equal(cli(dir, c2, c2).status, 0, 'an equal tip must pass');
  // a force-push: main is reset to the first commit and given a different second commit
  git(dir, 'reset', '-q', '--hard', c1);
  git(dir, 'commit', '-q', '--allow-empty', '-m', 'rewritten');
  const c3 = git(dir, 'rev-parse', 'HEAD');
  const forced = cli(dir, c2, c3);
  assert.equal(forced.status, 1, `a rewritten main must fail: ${forced.stdout}`);
  assert.match(forced.stdout, /FAIL/);
  const gone = cli(dir, c3, '0'.repeat(40));
  assert.equal(gone.status, 1, 'a deleted main must fail');
  const unread = cli(dir, 'f'.repeat(40), c3);
  assert.equal(unread.status, 2, 'a before commit that cannot be read is UNKNOWN');
  assert.equal(cli(dir, c1, 'e'.repeat(40)).status, 2, 'an after commit that cannot be read is UNKNOWN');
}
