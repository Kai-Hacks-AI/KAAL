// Case release/T1590 tests: release/C161. The succession entry judges the edges of the carried Changes against main. Behaviour, positive and negative. The shape of an edge follows Change's PLAN.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1590';
export const tests = ['release/C161'];
export const title = 'the succession entry passes a delivered predecessor, fails an absent or changed one, and is UNKNOWN on an unreadable fact set';
export async function run() {
  const ENTRY = join(repo, 'engineering/release-management/05-src/succession/judge-succession.mjs');
  assert.ok(existsSync(ENTRY), 'the entry judge-succession.mjs is absent');
  const { check } = await import(pathToFileURL(ENTRY).href);
  assert.equal(typeof check, 'function', 'the entry exports no check');
  const on = { 'release/C1': { present: true, digest: 'aaa' } };
  const kind = async (f) => (await check(f)).kind;
  assert.equal(await kind({ edges: [{ from: 'release/C2', to: 'release/C1', pinned: 'aaa' }], main: on }), 'pass', 'a delivered predecessor with the pinned bytes passes');
  assert.equal(await kind({ edges: [], main: on }), 'pass', 'a collector with no edge passes');
  assert.equal(await kind({ edges: [{ from: 'release/C2', to: 'release/C9', pinned: 'aaa' }], main: on }), 'fail', 'a predecessor that is not on main fails');
  assert.equal(await kind({ edges: [{ from: 'release/C2', to: 'release/C1', pinned: 'bbb' }], main: on }), 'fail', 'a predecessor whose bytes differ fails');
  let unreadable;
  try { unreadable = await kind({}); } catch { unreadable = 'unknown'; }
  assert.equal(unreadable, 'unknown', 'an unreadable fact set is UNKNOWN, never a pass');
}
