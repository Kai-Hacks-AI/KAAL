// Case release/T582 tests: G70
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const wiring = join(repo, 'engineering/release-management/05-src/wiring');
const here = join(repo, 'engineering/release-management/00-changes/C42-analyze-vulnerabilities-stages');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const needs = () => JSON.parse(read(join(here, 'ruleset-needs.json'), 'the proposed needs'));
export const id = 'release/T582';
export const tests = ['release/G70'];
export const title = 'gap release/G70 is closed: the workflow source reports each stage-named check on a pull request and a merge group';
export function run() {
  const wf = read(join(wiring, 'workflows/analyze-vulnerabilities.yml'), 'the workflow source');
  assert.match(wf, /pull_request:/, 'it runs on pull requests');
  assert.match(wf, /merge_group:/, 'it runs on the merge group');
  for (const p of needs().per_stage) {
    assert.ok(wf.includes(`name: ${p.context}`), `a job is named ${p.context}`);
  }
}
