// Case release/T1589 tests: release/C158. The synchronization entry of the Branching replacement gives the verdicts of its acceptance expectations: it passes a valid synchronization, fails each way one is not valid, says not applicable for an ordinary Change, and never passes a missing fact set. Positive and negative, so an always-refusing entry fails it.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/lineage/judge-synchronization.mjs');
export const id = 'release/T1589';
export const tests = ['release/C158'];
export const title = 'the synchronization entry of the Branching replacement passes a valid synchronization, fails each way one is not valid, and never passes a missing fact set';
export async function run() {
  assert.ok(existsSync(ENTRY), 'the entry judge-synchronization.mjs is absent');
  const { check } = await import(pathToFileURL(ENTRY).href);
  assert.equal(typeof check, 'function', 'the entry exports no check');
  const sha = (c) => c.repeat(40);
  const valid = {
    defaultBranch: 'main', lineage: 'kaal/release/x', defaultTip: sha('a'), lineageTip: sha('b'), head: sha('c'),
    merged: sha('a'), marker: null, onLineageTip: true, carriesDefault: true, markerOnDefault: true, adopted: [], advances: true,
    incorporated: sha('d'), expected: { clean: true, tree: 'T', conflicts: [] }, differing: [],
  };
  const kind = async (f) => (await check({ ...valid, ...f })).kind;
  assert.equal(await kind({}), 'pass', 'a valid synchronization passes');
  assert.equal(await kind({ onLineageTip: false }), 'fail', 'a synchronization off the lineage tip fails');
  assert.equal(await kind({ advances: false }), 'fail', 'a synchronization with no progress fails');
  assert.equal(await kind({ markerOnDefault: false }), 'fail', 'a merged state not on the default branch fails');
  assert.equal(await kind({ differing: ['x.md'] }), 'fail', 'a merge that differs outside the conflicts fails');
  assert.equal(await kind({ merged: null, carriesDefault: true }), 'fail', 'an ordinary Change that carries default history fails');
  assert.equal(await kind({ merged: null, carriesDefault: false }), 'not-applicable', 'an ordinary Change is not a synchronization');
  let missing;
  try { missing = (await check({})).kind; } catch { missing = 'unknown'; }
  assert.notEqual(missing, 'pass', 'a missing fact set must not pass');
}
