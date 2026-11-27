// Case release/T1602 tests: release/C164. The ordinary poll of the merge-group review grows its interval, so ten minutes of pending checks cost at most 20 reads (the 20-second poll costs 30).
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FILE = join(repo, 'engineering/release-management/05-src/merge-group/wait-for-checks.mjs');
export const id = 'release/T1602';
export const tests = ['release/C164'];
export const title = 'ten minutes of pending checks cost at most 20 reads of the merge-group review';
export async function run() {
  assert.ok(existsSync(FILE), 'wait-for-checks.mjs is absent');
  const { schedule } = await import(pathToFileURL(FILE).href);
  assert.equal(typeof schedule, 'function', 'it exports no schedule');
  // schedule(n): the wait in seconds before read n+1, for n = 1, 2, ...
  let t = 0;
  let reads = 1;
  while (t < 600) { t += schedule(reads); reads += 1; }
  assert.ok(reads - 1 <= 20, `${reads - 1} reads in ten minutes`);
  assert.ok(schedule(1) >= 20, 'the first waits are not shorter than 20 seconds');
  assert.ok(schedule(100) <= 120, 'a wait never grows past 120 seconds');
}
