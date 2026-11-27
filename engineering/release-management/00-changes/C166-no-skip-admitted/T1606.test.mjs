// Case release/T1606 tests: release/C166. A synchronization is a merge commit, never a fast-forward: the lineage verdict refuses a head that is a commit of the default branch which the collector does not hold, so no skip in check 1 is needed to keep a fast-forward from passing.
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1606';
export const tests = ['release/C166'];
export const title = 'the lineage verdict refuses a fast-forward synchronization, so the skip of a head already on the default branch is not needed';
const git = (cwd, ...a) => { const r = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd, encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
export async function run() {
  const dir = mkdtempSync(join(tmpdir(), 't1606-'));
  try {
    const origin = join(dir, 'origin.git');
    git(dir, 'init', '-q', '--bare', '-b', 'main', origin);
    const work = join(dir, 'work');
    git(dir, 'clone', '-q', origin, work);
    const put = (f, text) => { const p = join(work, f); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); };
    mkdirSync(join(work, 'engineering/github'), { recursive: true });
    copyFileSync(join(repo, 'engineering/github/lineage.ts'), join(work, 'engineering/github/lineage.ts'));
    put('base.txt', 'b\n');
    git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'base'); git(work, 'push', '-q', 'origin', 'HEAD:main'); git(work, 'push', '-q', 'origin', 'HEAD:refs/heads/kaal/x');
    put('docs/a.md', 'x\n');
    git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'main moves'); git(work, 'push', '-q', 'origin', 'HEAD:main');
    const main = git(work, 'rev-parse', 'HEAD');
    const tip = git(work, 'rev-parse', 'origin/kaal/x');
    git(work, 'fetch', '-q', 'origin');
    const r = spawnSync(process.execPath, [join(work, 'engineering/github/lineage.ts'), 'synchronization', 'main', 'kaal/x', 'origin/main', tip, main, '--resolutions', join(dir, 'resolved')], { cwd: work, encoding: 'utf8' });
    assert.equal(r.status, 1, `a fast-forward head is refused: ${r.stdout}${r.stderr}`);
    assert.match(r.stdout + r.stderr, /neither an ordinary Change nor a synchronization/, 'the refusal says why');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
