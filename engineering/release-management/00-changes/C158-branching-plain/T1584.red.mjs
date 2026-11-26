// Case release/T1584 tests: release/C158. The freshness entry and the synchronization entry of the Branching replacement never pass a missing fact set: UNKNOWN is never permission.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1584';
export const tests = ['release/C158'];
export const title = 'the freshness and synchronization entries of the Branching replacement never pass a missing fact set';
export async function run() {
  for (const v of ['freshness', 'synchronization']) {
    const entry = join(repo, `engineering/release-management/05-src/lineage/judge-${v}.mjs`);
    assert.ok(existsSync(entry), `the entry judge-${v}.mjs is absent`);
    const { check } = await import(pathToFileURL(entry).href);
    assert.equal(typeof check, 'function', `${v}: the entry exports no check`);
    let answer;
    try { answer = await check({}); } catch { answer = { kind: 'unknown' }; }
    assert.notEqual(answer?.kind, 'pass', `${v}: a missing fact set must not pass`);
  }
}
