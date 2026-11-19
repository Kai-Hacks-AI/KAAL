// Case release/T1166 tests: release/F73
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { RM } from '../../03-architecture/A67-delivery-locations/fixtures.mjs';
export const id = 'release/T1166';
export const tests = ['release/F73'];
export const title = 'the rule reports and gates nothing, and an unreadable declaration is not judged';
export async function run() {
  const CHECK = join(RM, '..', 'change-isolation', 'check.mjs');
  const { check, deliveryMixed, CannotJudge } = await import(pathToFileURL(CHECK).href);
  assert.equal(typeof deliveryMixed, 'function', 'the checker has no deliveryMixed');
  const broken = () => { throw new Error('unreadable'); };
  assert.throws(() => deliveryMixed(['.githooks/a', 'engineering/x'], { read: broken }), (e) => e instanceof CannotJudge, 'an unreadable declaration cannot be judged');
  assert.deepEqual(check(['.githooks/pre-push', 'engineering/a/x.md']), [], 'the checker\'s verdict is unchanged: the new rule is detective');
  const run = spawnSync('node', [CHECK], { input: '.githooks/pre-push\nengineering/a/x.md\n', encoding: 'utf8' });
  assert.equal(run.status, 0, 'it gates nothing');
  assert.match(run.stdout, /^ok: 2 changed paths conform/);
  assert.match(run.stdout, /\ndetective \(not gating\):.*engineering\/a\/x\.md/, 'it reports the mixed change, after its verdict');
}
