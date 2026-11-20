// Case architecture/T30 tests: architecture/D3
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'architecture/T30';
export const tests = ['architecture/D3'];
export const title = 'every Change folder under packages/ that holds a do.md holds its act.md';

export async function run() {
  const tracked = new Set(execFileSync('git', ['-C', root, 'ls-files', '--', 'packages'], { encoding: 'utf8' }).split('\n').filter(Boolean));
  const withoutAct = [...tracked]
    .filter((p) => /^packages\/[^/]+\/00-changes\/[^/]+\/do\.md$/.test(p))
    .map((p) => p.slice(0, -'/do.md'.length))
    .filter((dir) => !tracked.has(`${dir}/act.md`))
    .sort();
  assert.deepEqual(withoutAct, [], `these Changes hold a do.md and no act.md: ${withoutAct.join(', ')}`);
}
