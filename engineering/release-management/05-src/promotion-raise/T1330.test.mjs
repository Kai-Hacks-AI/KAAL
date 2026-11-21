// Case release/T1330 tests: release/F70
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, renameSync, cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { makeTree, retroText, REPO, SHA } from './tree-fixtures.mjs';
import { changedPaths } from './tree.mjs';
import { decideKaal } from './dispatch.mjs';
export const id = 'release/T1330';
export const tests = ['release/F70'];
export const title = 'the merge is read from git as data: the paths a squash changed (both ends of a rename), refused for a merge of two parents, and the whole decision from a checkout';
export async function run() {
  const git = (dir, ...a) => execFileSync('git', ['-C', dir, '-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...a], { encoding: 'utf8' });
  const dir = mkdtempSync(join(tmpdir(), 'kaal-git-'));
  try {
    git(dir, 'init', '-q', '-b', 'main');
    writeFileSync(join(dir, 'a.txt'), 'a'); writeFileSync(join(dir, 'b.txt'), 'b');
    git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'one');
    renameSync(join(dir, 'a.txt'), join(dir, 'c.txt')); mkdirSync(join(dir, 'd')); writeFileSync(join(dir, 'd/e.txt'), 'e');
    git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'two');
    assert.deepEqual(changedPaths(dir).sort(), ['a.txt', 'c.txt', 'd/e.txt'], 'both ends of a rename, and the new file');
    git(dir, 'checkout', '-q', '-b', 'side', 'HEAD^'); writeFileSync(join(dir, 'f.txt'), 'f'); git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'side');
    git(dir, 'checkout', '-q', 'main'); git(dir, 'merge', '-q', '--no-ff', '-m', 'merge', 'side');
    assert.throws(() => changedPaths(dir), /2 parents/, 'a merge commit is not a squash');

    // The whole decision from a checkout, as the workflow runs it: the judge side is this repository, the collector is data.
    const t = makeTree({ changes: [{ n: 2, name: 'first-thing' }], retros: [] });
    const collector = join(tmpdir(), `kaal-coll-${process.pid}`);
    try {
      cpSync(t.collector, collector, { recursive: true });
      git(collector, 'init', '-q', '-b', 'kaal/cap/small-thing'); git(collector, 'add', '-A'); git(collector, 'commit', '-qm', 'work');
      mkdirSync(join(collector, 'engineering/cap/02-learnings/retros'), { recursive: true });
      writeFileSync(join(collector, 'engineering/cap/02-learnings/retros/RT1.md'), retroText(1, ['cap/C1', 'cap/C2']));
      git(collector, 'add', '-A'); git(collector, 'commit', '-qm', 'act');
      const env = { KAAL_PR_MERGED: 'true', KAAL_PR_BASE: 'kaal/cap/small-thing', KAAL_PR_MERGE_SHA: SHA, KAAL_PR_NUMBER: '9', KAAL_MAIN_DIR: REPO, KAAL_COLLECTOR_DIR: collector };
      const d = await decideKaal(env);
      assert.equal(d.action, 'raise', d.detail);
      assert.equal(d.title, 'PROMOTION: cap small-thing');
      const bad = await decideKaal({ ...env, KAAL_COLLECTOR_DIR: join(collector, 'nowhere') });
      assert.equal(bad.action, 'skip', 'a checkout that cannot be read never raises');
    } finally { rmSync(collector, { recursive: true, force: true }); t.cleanup(); }
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
