// Case release/T385 tests: release/F71 (the before tree of the GitHub adapter, the step run as written)
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const MOD = join(RM, '05-src/hotfix/verify-hotfix.mjs');
const load = () => import(pathToFileURL(MOD).href);

const draftOf = (name) => readFileSync(join(RM, '00-changes/C94-verify-hotfix/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T385';
export const tests = ['release/F71', 'release/A66'];
export const title = 'the adapter makes the before tree from exactly the commit the Hotfix names, run as written in a scratch clone: an ancestor of the head makes it; no affected state, an unknown commit and a commit that is not an ancestor of the head make no before tree and leave a note, and the default branch is never substituted';
export async function run() {
  assert.ok(existsSync(MOD), 'the verify Hotfix module is absent');
  // the step as written in the adapter's source
  const yml = draftOf('verify-hotfix.yml');
  const step = /- name: Make the before tree[^\n]*\n\s+run: \|\n((?: {10}.*\n?)+)/.exec(yml)?.[1];
  assert.ok(step, 'the adapter has no step that makes the before tree');
  const script = step.replace(/^ {10}/gm, '');
  const tmp = mkdtempSync(join(tmpdir(), 'hotfix-adapter-'));
  const clone = join(tmp, 'clone');
  mkdirSync(join(clone, 'engineering/release-management/05-src'), { recursive: true });
  execFileSync('cp', ['-r', join(RM, '05-src/hotfix'), join(clone, 'engineering/release-management/05-src/hotfix')]);
  execFileSync('cp', ['-r', join(RM, '05-src/plan-body'), join(clone, 'engineering/release-management/05-src/plan-body')]);
  const git = (...a) => execFileSync('git', ['-C', clone, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' });
  git('init', '-q', '-b', 'main');
  writeFileSync(join(clone, 'a.txt'), '1\n');
  git('add', '-A'); git('commit', '-q', '-m', 'affected');
  const affected = git('rev-parse', 'HEAD').trim();
  writeFileSync(join(clone, 'a.txt'), '2\n');
  git('commit', '-q', '-am', 'main moves on');
  const moved = git('rev-parse', 'HEAD').trim();
  git('checkout', '-q', '-b', 'hotfix', affected);
  writeFileSync(join(clone, 'a.txt'), '3\n');
  git('commit', '-q', '-am', 'hotfix');
  git('update-ref', 'refs/remotes/pull/head', git('rev-parse', 'HEAD').trim());
  const stray = (() => { git('checkout', '-q', '-b', 'stray', 'main'); writeFileSync(join(clone, 'b.txt'), 'x\n'); git('add', '-A'); git('commit', '-q', '-m', 'stray'); return git('rev-parse', 'HEAD').trim(); })();
  git('checkout', '-q', 'hotfix');
  const attempt = (line) => {
    const runner = join(tmp, `r-${Math.random().toString(16).slice(2)}`);
    mkdirSync(runner);
    const body = `## Defect\n\nhosting/D1 broken.\n${line}\n`;
    writeFileSync(join(runner, 'x'), '');
    execFileSync('bash', ['-ec', script], { cwd: clone, env: { ...process.env, RUNNER_TEMP: runner, PR_BODY: body }, stdio: 'ignore' });
    const notes = existsSync(join(runner, 'runs/notes.txt')) ? readFileSync(join(runner, 'runs/notes.txt'), 'utf8') : '';
    const before = existsSync(join(runner, 'before')) ? readFileSync(join(runner, 'before/a.txt'), 'utf8') : null;
    return { notes, before, after: existsSync(join(runner, 'after')) };
  };
  const ok = attempt(`Affected: ${affected}`);
  assert.equal(ok.notes, '', 'a valid affected state left a note');
  assert.equal(ok.before, '1\n', 'the before tree is not exactly the affected commit (the default branch has moved on to 2)');
  assert.ok(ok.after, 'the after tree is not made');
  const none = attempt('');
  assert.equal(none.before, null, 'with no affected state a before tree was made, from the default branch?');
  assert.match(none.notes, /names no affected state/);
  const unknown = attempt(`Affected: ${'c'.repeat(40)}`);
  assert.equal(unknown.before, null);
  assert.match(unknown.notes, /is not a commit of this repository/);
  const unrelated = attempt(`Affected: ${stray}`);
  assert.equal(unrelated.before, null, 'a commit the Hotfix is not built on was taken as before');
  assert.match(unrelated.notes, /is not an ancestor of the head/);
  assert.notEqual(moved, affected);
}
