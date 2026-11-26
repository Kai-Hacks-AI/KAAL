// Case release/T1586 tests: release/C159. The head evidence entry of the Promotion Source replacement passes only for all-green required checks at the head, and never passes absent check evidence. Behaviour, not structure.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/promotion-source/judge-head-evidence.mjs');
export const id = 'release/T1586';
export const tests = ['release/C159'];
export const title = 'the head evidence entry of the Promotion Source replacement passes only for all-green required checks and never passes absent evidence';
export async function run() {
  assert.ok(existsSync(ENTRY), 'the entry judge-head-evidence.mjs is absent');
  const { check } = await import(pathToFileURL(ENTRY).href);
  assert.equal(typeof check, 'function', 'the entry exports no check');
  const head = '0123456789abcdef0123456789abcdef01234567';
  const base = { repo: 'o/r', defaultBranch: 'main', baseRef: 'main', headRepo: 'o/r', headRef: 'kaal/release/x', head };
  const run1 = (conclusion, status = 'completed') => ({ id: 1, name: 'Engineering', status, conclusion, headSha: head });
  const checks = (r) => ({ required: [{ context: 'Engineering' }], runs: r });
  const kind = async (f) => (await check({ ...base, ...f })).kind;
  assert.equal(await kind({ checks: checks([run1('success')]) }), 'pass', 'all green passes');
  assert.equal(await kind({ checks: checks([run1('failure')]) }), 'fail', 'a red required check fails');
  assert.equal(await kind({ checks: checks([run1(null, 'in_progress')]) }), 'fail', 'a pending required check fails');
  assert.notEqual(await kind({}), 'pass', 'absent check evidence is not a pass');
}
