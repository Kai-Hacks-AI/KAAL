// Case release/T872 tests: release/C67
import assert from 'node:assert/strict';
import { routeProblems, verify } from './fixtures.mjs';
export const id = 'release/T872';
export const tests = ['release/C67', 'release/D1'];
export const title = 'a PROMOTION from a hotfix/ branch into main and a SYNC into a hotfix/ or wire/ branch are on their routes; a hotfix/ head under any other TYPE is a finding, and the other routes are unchanged';
export async function run() {
  const base = { body: '' };
  const on = async (type, facts) => routeProblems(await verify({ title: `${type}: A sample`, ...base, ...facts }));
  assert.deepEqual(await on('PROMOTION', { base: 'main', head: 'hotfix/restore-sample' }), [], 'a PROMOTION from a hotfix/ head into main is a finding');
  assert.deepEqual(await on('PROMOTION', { base: 'main', head: 'kaal/release/sample' }), [], 'a PROMOTION from a collector into main is a finding');
  for (const into of ['hotfix/restore-sample', 'wire/templates', 'kaal/release/sample']) {
    assert.deepEqual(await on('SYNC', { base: into, head: 'claude/sync' }), [], `a SYNC into ${into} is a finding`);
  }
  assert.ok((await on('PROMOTION', { base: 'main', head: 'claude/x' })).length > 0, 'a PROMOTION from a Development branch is accepted');
  assert.ok((await on('PROMOTION', { base: 'hotfix/restore-sample', head: 'hotfix/other' })).length > 0, 'a PROMOTION into a hotfix/ branch is accepted');
  assert.ok((await on('SYNC', { base: 'main', head: 'claude/sync' })).length > 0, 'a SYNC into main is accepted');
  assert.ok((await on('PLAN', { base: 'hotfix/restore-sample', head: 'claude/x' })).length > 0, 'a PLAN into a hotfix/ branch is accepted');
  const fromHotfix = await on('DO', { base: 'kaal/release/sample', head: 'hotfix/restore-sample' });
  assert.ok(fromHotfix.some((p) => /must be a PROMOTION/.test(p)), `a hotfix/ head under another TYPE is not a finding that says it is promoted: ${fromHotfix.join('; ')}`);
}
