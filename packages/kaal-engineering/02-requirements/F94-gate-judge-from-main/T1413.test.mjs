// Case engineering/T1413 tests: engineering/F94
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { src, gateJobs } from '../F93-codeql-gate-workflow/fixture.mjs';
export const id = 'engineering/T1413';
export const tests = ['engineering/F94'];
export const title = 'each gate job checks out the default branch only, without credentials, and nothing of the pull request';
export async function run() {
  for (const { name, job } of gateJobs(readFileSync(src, 'utf8'))) {
    assert.ok(job, `no job named ${name}`);
    const checkouts = [...job.matchAll(/^\s*- uses: actions\/checkout@.*\n((?:\s{8,}.+\n?)*)/gm)];
    assert.equal(checkouts.length, 1, `${name} does not have exactly one checkout`);
    const w = checkouts[0][1];
    assert.match(w, /^\s*ref:\s*\$\{\{\s*github\.event\.repository\.default_branch\s*\}\}\s*$/m, `${name} does not check out the default branch`);
    assert.match(w, /^\s*persist-credentials:\s*false\s*$/m, `${name} persists credentials`);
    assert.ok(!/pull_request\.head|github\.sha|refs\/pull|merge_group\.head/.test(job.replace(/GITHUB_SHA/g, '')), `${name} refers to the pull request's own ref`);
  }
}
