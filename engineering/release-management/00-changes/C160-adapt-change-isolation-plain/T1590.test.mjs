// Case release/T1590 tests: release/C160. The two entries of the Change Isolation (check 1) replacement judge a change as the old workflow did: a verified synchronization of a collector by its own explicit resolutions only (the merged state of the default branch is not its change), a head already on the default branch does not apply, and any other change into a collector is judged whole. Behaviour, with real Git.
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRIES = ['github-alone', 'delivery'].map((v) => join(repo, `engineering/release-management/05-src/change-isolation/judge-${v}.mjs`));
export const id = 'release/T1590';
export const tests = ['release/C160'];
export const title = 'the entries of the Change Isolation replacement judge a verified synchronization by its own resolutions only, do not apply to a head already on the default branch and judge any other change whole';
const git = (cwd, ...a) => { const r = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd, encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
const world = (dir, { lineage = true } = {}) => {
  const origin = join(dir, 'origin.git');
  git(dir, 'init', '-q', '--bare', '-b', 'main', origin);
  const work = join(dir, 'work');
  git(dir, 'clone', '-q', origin, work);
  const put = (f, text) => { const p = join(work, f); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); };
  if (lineage) { mkdirSync(join(work, 'engineering/github'), { recursive: true }); copyFileSync(join(repo, 'engineering/github/lineage.ts'), join(work, 'engineering/github/lineage.ts')); }
  put('base.txt', 'b\n'); put('.github/old.yml', 'a\n'); put('.github/c.yml', 'c0\n'); put('docs/c.md', 'c0\n');
  git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'base'); git(work, 'push', '-q', 'origin', 'HEAD:main'); git(work, 'push', '-q', 'origin', 'HEAD:refs/heads/kaal/x');
  const go = (entry, head, base, baseRef) => {
    const r = spawnSync(process.execPath, [entry, '--head', head, '--base', base, '--base-ref', baseRef], { cwd: work, encoding: 'utf8', env: { ...process.env, KAAL_DEFAULT: 'main' } });
    return { code: r.status, text: r.stdout + r.stderr };
  };
  return { work, put, go };
};
export async function run() {
  const dir = mkdtempSync(join(tmpdir(), 't1590-'));
  try {
    const { work, put, go } = world(dir);
    // main moves with a change that mixes .github and another path: accepted there, and only carried into the collector by a synchronization
    put('.github/new.yml', 'x\n'); put('docs/a.md', 'x\n');
    git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'main moves'); git(work, 'push', '-q', 'origin', 'HEAD:main');
    const main = git(work, 'rev-parse', 'HEAD');
    git(work, 'checkout', '-q', '-b', 'sync', 'origin/kaal/x');
    git(work, 'merge', '-q', '--no-ff', '-m', 'sync', main);
    const sync = git(work, 'rev-parse', 'HEAD');
    const tip = git(work, 'rev-parse', 'origin/kaal/x');
    git(work, 'fetch', '-q', 'origin');
    for (const entry of ENTRIES) {
      const s = go(entry, sync, tip, 'kaal/x');
      assert.equal(s.code, 0, `a verified synchronization is judged by its own resolutions: ${s.text}`);
      assert.match(s.text, /verified synchronization/, 'it is recognised as one');
      assert.match(s.text, /PASS/, 'what main carried is not the synchronization\'s change');
    }
    // the head is already on the default branch: this check does not apply
    const done = go(ENTRIES[0], main, tip, 'kaal/x');
    assert.equal(done.code, 0, done.text);
    assert.match(done.text, /does not apply/, 'a head already admitted on the default branch does not apply');
    // an ordinary change into the collector is judged whole, and a mix is reported
    git(work, 'checkout', '-q', '-b', 'cand', 'origin/kaal/x');
    put('.github/c2.yml', 'c\n'); put('docs/c2.md', 'c\n');
    git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'cand');
    const cand = git(work, 'rev-parse', 'HEAD');
    const mixed = go(ENTRIES[0], cand, tip, 'kaal/x');
    assert.match(mixed.text, /\.github travels alone: docs\/c2\.md/, `an ordinary change into a collector is judged whole: ${mixed.text}`);
    assert.doesNotMatch(mixed.text, /verified synchronization/);
  } finally { rmSync(dir, { recursive: true, force: true }); }

  // a verified synchronization is not skipped: its own explicit resolutions are judged, and resolutions that mix .github with another path are reported
  const dir2 = mkdtempSync(join(tmpdir(), 't1590-'));
  try {
    const { work, put, go } = world(dir2);
    // the collector and main change the same two files differently: a conflict in a .github path and in a docs path, both resolved by hand in the merge
    git(work, 'checkout', '-q', '-b', 'own', 'origin/kaal/x');
    put('.github/c.yml', 'own\n'); put('docs/c.md', 'own\n');
    git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'own'); git(work, 'push', '-q', 'origin', 'HEAD:refs/heads/kaal/x');
    git(work, 'checkout', '-q', 'main');
    put('.github/c.yml', 'main\n'); put('docs/c.md', 'main\n');
    git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'main'); git(work, 'push', '-q', 'origin', 'HEAD:main');
    const main = git(work, 'rev-parse', 'HEAD');
    git(work, 'checkout', '-q', '-b', 'sync', 'origin/kaal/x');
    spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'merge', '--no-ff', '-m', 'sync', main], { cwd: work });
    assert.ok(git(work, 'rev-parse', '-q', '--verify', 'MERGE_HEAD'), 'the merge stopped on its conflicts, so its resolutions are explicit');
    put('.github/c.yml', 'resolved\n'); put('docs/c.md', 'resolved\n');
    git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'sync');
    const sync = git(work, 'rev-parse', 'HEAD');
    const tip = git(work, 'rev-parse', 'origin/kaal/x');
    git(work, 'fetch', '-q', 'origin');
    const r = go(ENTRIES[0], sync, tip, 'kaal/x');
    const lineage = spawnSync(process.execPath, [join(work, 'engineering/github/lineage.ts'), 'synchronization', 'main', 'kaal/x', 'origin/main', tip, sync], { cwd: work, encoding: 'utf8' });
    assert.match(r.text, /verified synchronization/, `it is a verified synchronization (lineage says ${lineage.status}: ${lineage.stdout}${lineage.stderr}): ${r.text}`);
    assert.match(r.text, /\.github travels alone: docs\/c\.md/, `the resolutions that mix .github with another path are reported: ${r.text}`);
    assert.doesNotMatch(r.text, /PASS/, 'a synchronization with violating resolutions does not pass');
  } finally { rmSync(dir2, { recursive: true, force: true }); }

  // a lineage verdict that cannot be read is UNKNOWN, never a pass: the default branch holds no lineage.ts
  const dir3 = mkdtempSync(join(tmpdir(), 't1590-'));
  try {
    const { work, put, go } = world(dir3, { lineage: false });
    git(work, 'checkout', '-q', '-b', 'cand', 'origin/kaal/x');
    put('docs/z.md', 'z\n'); git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'cand');
    const cand = git(work, 'rev-parse', 'HEAD');
    const tip = git(work, 'rev-parse', 'origin/kaal/x');
    for (const entry of ENTRIES) {
      const r = go(entry, cand, tip, 'kaal/x');
      assert.equal(r.code, 2, `an unreadable lineage verdict is not a pass: ${r.text}`);
      assert.match(r.text, /UNKNOWN/, 'it says UNKNOWN');
      assert.doesNotMatch(r.text, /PASS/);
    }
  } finally { rmSync(dir3, { recursive: true, force: true }); }
}
