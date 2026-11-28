// Case release/T1583 tests: release/C158. The auto-merge entry of the Branching replacement gives the verdict autoMerge of lineage.ts gives for the four fact sets of the acceptance expectations. Behaviour, not structure.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/lineage/judge-auto-merge.mjs');
export const id = 'release/T1583';
export const tests = ['release/C158'];
export const title = 'the auto-merge entry of the Branching replacement gives the verdicts of its acceptance expectations';
export async function run() {
  assert.ok(existsSync(ENTRY), 'the entry judge-auto-merge.mjs is absent');
  const { check } = await import(pathToFileURL(ENTRY).href);
  assert.equal(typeof check, 'function', 'the entry exports no check');
  const base = { baseRef: 'main', head: '0123456789abcdef0123456789abcdef01234567' };
  const kind = async (f) => (await check({ ...base, ...f })).kind;
  assert.equal(await kind({ expected: 'squash', enabled: 'squash' }), 'pass', 'the right method passes');
  assert.equal(await kind({ expected: 'squash', enabled: null }), 'fail', 'disabled auto-merge fails');
  assert.equal(await kind({ expected: 'squash', enabled: 'merge' }), 'fail', 'another method fails');
  assert.equal(await kind({ expected: null, enabled: 'squash' }), 'fail', 'no right method fails');
}
