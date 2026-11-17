// Case release/T755 tests: release/C58
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const MODULE = join(repo, 'engineering/release-management/05-src/sync-review/approve.mjs');
export const id = 'release/T755';
export const tests = ['release/C58'];
export const title = 'approve Sync approves only a passing verdict at the current head, never into main, and only when switched on; otherwise it says what it would do or skips';
const H = 'c'.repeat(40);
const verdict = (over = {}) => ({ control: 'verify Sync', outcome: 'PASS', passes: true, reasons: [], analyzed: { base: { ref: 'kaal/release/x', tip: 'a'.repeat(40) }, head: H }, ...over });
export async function run() {
  assert.ok(existsSync(MODULE), 'approve.mjs is absent');
  const { decideApprove } = await import(pathToFileURL(MODULE).href);
  const ask = (over = {}) => decideApprove({ verdict: verdict(), currentHead: H, mode: 'on', approvedAtHead: false, ...over });
  assert.equal(ask().action, 'approve');
  for (const mode of [undefined, '', 'dry-run', 'ON', 'true', '1', 'off']) assert.equal(ask({ mode }).action, 'would-approve', `mode ${String(mode)} is not a dry run`);
  assert.equal(ask({ verdict: verdict({ outcome: 'FAIL', passes: false }) }).action, 'skip');
  assert.equal(ask({ verdict: verdict({ outcome: 'UNKNOWN', passes: false }) }).action, 'skip');
  assert.equal(ask({ verdict: undefined }).action, 'skip');
  assert.equal(ask({ verdict: verdict({ passes: true, outcome: 'FAIL' }) }).action, 'skip', 'a verdict that contradicts itself is not a pass');
  assert.equal(ask({ currentHead: '9'.repeat(40) }).action, 'skip', 'a verdict of another head is stale');
  assert.equal(ask({ verdict: verdict({ analyzed: { base: { ref: 'main', tip: 'a'.repeat(40) }, head: H } }) }).action, 'skip', 'main is never approved');
  assert.equal(ask({ approvedAtHead: true }).action, 'skip', 'an approval of this head already exists');
  for (const r of [ask(), ask({ mode: undefined }), ask({ verdict: undefined })]) {
    assert.ok(['approve', 'would-approve', 'skip'].includes(r.action));
    assert.equal(typeof r.because, 'string');
    assert.ok(r.because.length > 0);
  }
}
