// Case release/T1591 tests: release/C161. The Change Conflict entry reports a path owned by two collectors. Behaviour, positive and negative.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1591';
export const tests = ['release/C161'];
export const title = 'the Change Conflict entry passes disjoint own sets, reports an edge-ordered conflict without failing it, fails an unordered shared path and is UNKNOWN on an unreadable own set';
export async function run() {
  const ENTRY = join(repo, 'engineering/release-management/05-src/succession/judge-change-conflict.mjs');
  assert.ok(existsSync(ENTRY), 'the entry judge-change-conflict.mjs is absent');
  const { check } = await import(pathToFileURL(ENTRY).href);
  assert.equal(typeof check, 'function', 'the entry exports no check');
  const kind = async (f) => (await check(f)).kind;
  assert.equal(await kind({ collector: 'a', own: { a: ['x.md'], b: ['y.md'] } }), 'pass', 'disjoint own sets pass');
  const shared = await check({ collector: 'a', own: { a: ['x.md'], b: ['x.md'] }, orders: [] });
  assert.equal(shared.kind, 'fail', 'a path owned by two collectors that no edge orders fails');
  assert.match(JSON.stringify(shared), /x\.md/, 'the finding names the path');
  const ordered = await check({ collector: 'a', own: { a: ['x.md'], b: ['x.md'] }, orders: [{ from: 'a', to: 'b' }] });
  assert.equal(ordered.kind, 'pass', 'a conflict that a declared edge orders does not fail');
  assert.match(JSON.stringify(ordered), /ordered/, 'it is reported as ordered');
  let unreadable;
  try { unreadable = await kind({ collector: 'a', own: { a: ['x.md'], b: null } }); } catch { unreadable = 'unknown'; }
  assert.equal(unreadable, 'unknown', 'an unreadable own set is UNKNOWN, never no conflict');
}
