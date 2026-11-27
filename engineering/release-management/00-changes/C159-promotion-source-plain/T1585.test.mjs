// Case release/T1585 tests: release/C159. The origin entry of the Promotion Source replacement gives the verdicts of its acceptance expectations. Behaviour, not structure.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/promotion-source/judge-origin.mjs');
export const id = 'release/T1585';
export const tests = ['release/C159'];
export const title = 'the origin entry of the Promotion Source replacement gives the verdicts of its acceptance expectations';
export async function run() {
  assert.ok(existsSync(ENTRY), 'the entry judge-origin.mjs is absent');
  const { check } = await import(pathToFileURL(ENTRY).href);
  assert.equal(typeof check, 'function', 'the entry exports no check');
  const base = { repo: 'o/r', defaultBranch: 'main', baseRef: 'main', headRepo: 'o/r' };
  const kind = async (f) => (await check({ ...base, ...f })).kind;
  for (const headRef of ['kaal/release/x', 'hotfix/x', 'wire/x']) assert.equal(await kind({ headRef }), 'pass', `${headRef} passes`);
  assert.equal(await kind({ headRef: 'kaal/release/x', headRepo: 'f/r' }), 'fail', 'a fork head fails');
  assert.equal(await kind({ headRef: 'feature/x' }), 'fail', 'an other branch fails');
  assert.equal(await kind({ headRef: 'feature/x', baseRef: 'kaal/release/y' }), 'not-applicable', 'a base that is not the default branch is not applicable');
}
