// Case architecture/T30 tests: architecture/D3
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = `${root}/packages/kaal-architecture`;
export const id = 'architecture/T30';
export const tests = ['architecture/D3'];
export const title = 'the Cases of C15 are closed, so its ACT must have followed: a retrospective of C15 is in the package';

// The result, not the files: C15's PLAN ended in the Target Cases T14 to T22 (red).
// DO closes them. ACT is possible only when all of them are closed, and only after it is the collector done.
export async function run() {
  const caseFiles = execFileSync('git', ['-C', root, 'ls-files', '--', 'packages/kaal-architecture'], { encoding: 'utf8' })
    .split('\n').filter((p) => /\/T(1[4-9]|2[0-2])\.(test|red)\.mjs$/.test(p));
  assert.equal(caseFiles.length, 9, `the Cases T14 to T22 of C15 are not all there: ${caseFiles.join(', ')}`);
  const still = caseFiles.filter((p) => p.endsWith('.red.mjs'));
  assert.deepEqual(still, [], `Cases of C15 still red-named: ${still.join(', ')}`);
  const ran = spawnSync('node', ['--test', 'test/cases.test.mjs'], { cwd: pkg, encoding: 'utf8' });
  assert.equal(ran.status, 0, 'the Cases of C15 are not all green, so C15 is not closed and no ACT is due');

  // Closed. The ACT's result is a 4L retrospective of C15, found by what it says, not by its file name.
  const retro = execFileSync('git', ['-C', root, 'ls-files', '--', 'packages/kaal-architecture'], { encoding: 'utf8' })
    .split('\n').filter((p) => p.endsWith('.md')).filter((p) => {
      const t = readFileSync(`${root}/${p}`, 'utf8');
      return /^#+\s*(architecture\/)?C15\b.*\bact\b/im.test(t) && ['Liked', 'Learned', 'Lacked', 'Longed For'].every((h) => new RegExp(`^##\\s*${h}\\b`, 'm').test(t));
    });
  assert.ok(retro.length >= 1, 'C15 is closed (its Cases T14 to T22 are green) and no 4L retrospective of C15 follows it: the collector was promoted before its ACT');
}
