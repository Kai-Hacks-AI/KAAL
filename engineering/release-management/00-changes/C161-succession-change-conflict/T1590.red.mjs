// Case release/T1590 tests: release/C161. The succession entry judges the records of main and of the collector with Change's reader. Behaviour, positive and negative. The edge is { change, pin, because } (change/C15).
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const pinOf = (text) => createHash('sha256').update(text, 'utf8').digest('hex');
const record = (identity, extra = '') => `---\nid: ${identity}\ntitle: ${identity.split('/')[1]}\n${extra}---\n# ${identity}\n`;
const succeeds = (change, pin, because = 'cannot work without it on main') => `succeeds:\n  - change: ${change}\n    pin: ${pin}\n    because: ${because}\n`;
export const id = 'release/T1590';
export const tests = ['release/C161'];
export const title = 'the succession entry passes a delivered or co-carried predecessor and no edge, fails an absent, stale, other-collector or unreasoned one, and is UNKNOWN on an unreadable fact set';
export async function run() {
  const ENTRY = join(repo, 'engineering/release-management/05-src/succession/judge-succession.mjs');
  assert.ok(existsSync(ENTRY), 'the entry judge-succession.mjs is absent');
  const { check } = await import(pathToFileURL(ENTRY).href);
  assert.equal(typeof check, 'function', 'the entry exports no check');
  const a = record('release/C1');
  const rec = (identity, text) => ({ identity, text });
  const successor = (extra) => record('change/C2', extra);
  const kind = async (f) => (await check({ pinOf, ...f })).kind;
  assert.equal(await kind({ main: [rec('release/C1', a)], carried: [rec('change/C2', successor(succeeds('release/C1', pinOf(a))))] }), 'pass', 'a predecessor on main with the pinned bytes passes');
  assert.equal(await kind({ main: [], carried: [rec('release/C1', a), rec('change/C2', successor(succeeds('release/C1', pinOf(a))))] }), 'pass', 'a predecessor carried by the same collector passes');
  assert.equal(await kind({ main: [], carried: [rec('change/C2', successor(''))] }), 'pass', 'a collector with no edge passes');
  assert.equal(await kind({ main: [], carried: [rec('change/C2', successor(succeeds('release/C1', pinOf(a))))] }), 'fail', 'a predecessor that is not delivered fails');
  assert.equal(await kind({ main: [rec('release/C1', a + 'edited\n')], carried: [rec('change/C2', successor(succeeds('release/C1', pinOf(a))))] }), 'fail', 'a stale pin fails');
  assert.equal(await kind({ main: [], others: [rec('release/C1', a)], carried: [rec('change/C2', successor(succeeds('release/C1', pinOf(a))))] }), 'fail', 'a predecessor held only by another collector fails');
  assert.equal(await kind({ main: [rec('release/C1', a)], carried: [rec('change/C2', successor(succeeds('release/C1', pinOf(a), '')))] }), 'fail', 'an entry without a reason fails');
  let unreadable;
  try { unreadable = await kind({ pinOf: undefined }); } catch { unreadable = 'unknown'; }
  assert.equal(unreadable, 'unknown', 'an unreadable fact set is UNKNOWN, never a pass');
}
