// Case release/T1358 tests: release/C123
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM } from './attribution-fixtures.mjs';
export const id = 'release/T1358';
export const tests = ['release/C123'];
export const title = 'Git only brings the folders: no judge and no library module reads Git, and the workflow brings before and contained as folders without a credential';
export async function run() {
  const phase = join(RM, '05-src/phase');
  for (const f of ['run-controls-act.mjs', 'lib/attribute-changes.mjs', 'judge-limit-act.mjs', 'judge-demand-act.mjs', 'judge-verify-act.mjs', 'judge-act.mjs']) {
    assert.ok(existsSync(join(phase, f)), `${f} is absent`);
    assert.doesNotMatch(readFileSync(join(phase, f), 'utf8'), /child_process|execFileSync|spawnSync|rev-list|git diff/, `${f} reads Git`);
  }
  const code = readFileSync(join(RM, '05-src/wiring/workflows/controls-act.yml'), 'utf8').split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  assert.equal((code.match(/git -C pr worktree add --detach \.\.\/before /g) ?? []).length, 5);
  assert.equal((code.match(/git -C pr worktree add --detach \.\.\/contained "\$\(git -C pr merge-base HEAD FETCH_HEAD\)"/g) ?? []).length, 5);
  assert.equal((code.match(/--before before --contained contained/g) ?? []).length, 5);
  assert.doesNotMatch(code, /pull_request_target|secrets\.|GITHUB_TOKEN|github\.token/);
}
