// Case release/T1605 tests: release/C166. The entries of check 1 do not skip a head already on the default branch: they judge it whole like any other change, so a fast-forward synchronization that carries `.github` and another path is reported, never "does not apply".
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRIES = ['github-alone', 'delivery'].map((v) => join(repo, `engineering/release-management/05-src/change-isolation/judge-${v}.mjs`));
export const id = 'release/T1605';
export const tests = ['release/C166'];
export const title = 'the entries of check 1 judge a head already on the default branch whole and never say it does not apply';
const git = (cwd, ...a) => { const r = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd, encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
export async function run() {
  const dir = mkdtempSync(join(tmpdir(), 't1605-'));
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
    put('.github/new.yml', 'x\n'); put('docs/a.md', 'x\n');
    git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'main moves'); git(work, 'push', '-q', 'origin', 'HEAD:main');
    const main = git(work, 'rev-parse', 'HEAD');
    const tip = git(work, 'rev-parse', 'origin/kaal/x');
    git(work, 'fetch', '-q', 'origin');
    const r = spawnSync(process.execPath, [ENTRIES[0], '--head', main, '--base', tip, '--base-ref', 'kaal/x'], { cwd: work, encoding: 'utf8', env: { ...process.env, KAAL_DEFAULT: 'main' } });
    const text = r.stdout + r.stderr;
    assert.doesNotMatch(text, /does not apply/, `a head already on the default branch is not skipped: ${text}`);
    assert.match(text, /REPORT/, 'it is judged whole and the mix is reported');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
