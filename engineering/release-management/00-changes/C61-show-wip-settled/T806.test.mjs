// Case release/T806 tests: release/C61
import assert from 'node:assert/strict';
import { load, readerPath } from './fixtures.mjs';
export const id = 'release/T806';
export const tests = ['release/C61'];
export const title = 'the host adapter asks for the commits of the branch beyond the default branch in the direction default...branch, reads the pieces whose head is the branch, and leaves what it could not read absent with a gap';
export async function run() {
  const { branchPager, readBranches } = await load(readerPath);
  const asked = [];
  const answers = {
    'repos/o/r/branches?per_page=100&page=1': [{ name: 'main', commit: { sha: 'm1' } }, { name: 'kaal/x/done', commit: { sha: 'd1' } }, { name: 'kaal/x/gone', commit: { sha: 'g1' } }, { name: 'kaal/x/broken', commit: { sha: 'b1' } }, { name: 'kaal/x/fork', commit: { sha: 'f1' } }],
    'repos/o/r/compare/main...kaal/x/done': { ahead_by: 3, behind_by: 0 },
    'repos/o/r/compare/main...kaal/x/gone': { ahead_by: 2, behind_by: 5 },
    'repos/o/r/compare/main...kaal/x/fork': { ahead_by: 1 },
    'repos/o/r/pulls?head=o%3Akaal%2Fx%2Fdone&state=all&per_page=100': [{ state: 'closed', merged_at: '2026-11-02', closed_at: '2026-11-02', head: { sha: 'd1', ref: 'kaal/x/done', repo: { full_name: 'o/r' } } }],
    'repos/o/r/pulls?head=o%3Akaal%2Fx%2Fgone&state=all&per_page=100': [{ state: 'closed', merged_at: null, closed_at: '2026-11-02', head: { sha: 'g1', ref: 'kaal/x/gone', repo: { full_name: 'o/r' } } }],
    'repos/o/r/pulls?head=o%3Akaal%2Fx%2Ffork&state=all&per_page=100': [{ state: 'closed', merged_at: '2026-11-02', head: { sha: 'f1', ref: 'kaal/x/fork', repo: { full_name: 'someone/r' } } }],
  };
  const gh = async ([path]) => {
    asked.push(path);
    if (!(path in answers)) throw new Error(`no answer for ${path}`);
    return answers[path];
  };
  const { branches, gaps } = await readBranches('o/r', branchPager('main', gh));
  const by = Object.fromEntries(branches.map((b) => [b.name, b]));
  assert.deepEqual(by['kaal/x/done'], { name: 'kaal/x/done', head: 'd1', ahead: 3, settled: { outcome: 'delivered', head: 'd1' } });
  assert.deepEqual(by['kaal/x/gone'], { name: 'kaal/x/gone', head: 'g1', ahead: 2, settled: { outcome: 'discarded', head: 'g1' } }, 'ahead is not the commits of the branch beyond main');
  assert.deepEqual(by['kaal/x/fork'], { name: 'kaal/x/fork', head: 'f1', ahead: 1, settled: false }, 'a piece from a fork of the same name settled the branch');
  assert.deepEqual(by['kaal/x/broken'], { name: 'kaal/x/broken', head: 'b1' }, 'a failed read was filled in');
  assert.deepEqual(by.main, { name: 'main', head: 'm1' }, 'the default branch was compared with itself');
  assert.equal(gaps.length, 2, 'a failed read is not named');
  assert.ok(asked.every((p) => !p.includes('compare/kaal/') ), 'the comparison runs from the branch to the default branch');
}
