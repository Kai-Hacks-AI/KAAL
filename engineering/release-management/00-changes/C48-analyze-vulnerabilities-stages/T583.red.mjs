// Case release/T583 tests: G71
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const wiring = join(repo, 'engineering/release-management/05-src/wiring');
const here = join(repo, 'engineering/release-management/00-changes/C48-analyze-vulnerabilities-stages');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const needs = () => JSON.parse(read(join(here, 'stage-reports.json'), 'the proposed needs'));
export const id = 'release/T583';
export const tests = ['release/G71'];
export const title = 'gap release/G71 is closed: a real merge-queue run is recorded with its run URL and check-run names';
export function run() {
  const acc = read(join(here, 'acceptance.md'), 'the acceptance record');
  assert.match(acc, /https:\/\/github\.com\/[^\s/]+\/[^\s/]+\/actions\/runs\/\d+/, 'the record links the real run');
  for (const p of needs().per_stage) {
    if (p.stage === 'Promoting') assert.ok(acc.includes(p.context), `the record shows ${p.context} reported by GitHub`);
  }
  assert.match(acc, /merge_group|merge queue/i, 'the record states it was a merge-queue run');
  assert.match(acc, /integration[_ ]id/i, 'the record states the integration id');
}
