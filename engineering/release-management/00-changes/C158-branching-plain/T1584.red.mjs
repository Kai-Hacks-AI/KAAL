// Case release/T1584 tests: release/C158. The freshness entry of the Branching replacement gives the verdicts of its acceptance expectations: it passes a fresh promotion, fails each way a promotion is not fresh, and never passes a missing fact set. Positive and negative, so an always-refusing entry fails it.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/lineage/judge-freshness.mjs');
export const id = 'release/T1584';
export const tests = ['release/C158'];
export const title = 'the freshness entry of the Branching replacement passes a fresh promotion, fails each way it is not fresh, and never passes a missing fact set';
export async function run() {
  assert.ok(existsSync(ENTRY), 'the entry judge-freshness.mjs is absent');
  const { check } = await import(pathToFileURL(ENTRY).href);
  assert.equal(typeof check, 'function', 'the entry exports no check');
  const fresh = { defaultBranch: 'main', defaultTip: 'a'.repeat(40), headRef: 'kaal/release/x', head: 'b'.repeat(40), headTree: 'T', containsTip: true, merge: { clean: true, tree: 'T', conflicts: [] } };
  const kind = async (f) => (await check({ ...fresh, ...f })).kind;
  assert.equal(await kind({}), 'pass', 'a fresh promotion passes');
  assert.equal(await kind({ containsTip: false }), 'fail', 'a head that does not contain the default tip fails');
  assert.equal(await kind({ merge: { clean: false, tree: '', conflicts: ['a.md'] } }), 'fail', 'a conflicting merge fails');
  assert.equal(await kind({ merge: { clean: true, tree: 'OTHER', conflicts: [] } }), 'fail', 'a merge that yields an unvalidated tree fails');
  let missing;
  try { missing = (await check({})).kind; } catch { missing = 'unknown'; }
  assert.notEqual(missing, 'pass', 'a missing fact set must not pass');
}
