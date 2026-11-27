// Case release/T1587 tests: release/C160. The .github alone entry of the Change Isolation (check 1) replacement gives the verdicts of its acceptance expectations. Behaviour, not structure.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/change-isolation/judge-github-alone.mjs');
export const id = 'release/T1587';
export const tests = ['release/C160'];
export const title = 'the .github alone entry of the Change Isolation replacement gives the verdicts of its acceptance expectations';
export async function run() {
  assert.ok(existsSync(ENTRY), 'the entry judge-github-alone.mjs is absent');
  const { check } = await import(pathToFileURL(ENTRY).href);
  assert.equal(typeof check, 'function', 'the entry exports no check');
  const kind = async (paths) => (await check({ paths })).kind;
  assert.equal(await kind(['.github/workflows/a.yml', '.github/CODEOWNERS']), 'pass', 'a change inside .github passes');
  assert.equal(await kind(['engineering/a.md', 'packages/b.mjs']), 'pass', 'a change with no .github path passes');
  assert.equal(await kind(['.github/workflows/a.yml', 'engineering/a.md']), 'fail', '.github mixed with another path fails');
  assert.notEqual(await kind(undefined), 'pass', 'an unreadable path set is not a pass');
}
