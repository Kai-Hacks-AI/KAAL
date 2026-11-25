// Case engineering/T1414 tests: engineering/F94
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { src, gateJobs } from '../F93-codeql-gate-workflow/fixture.mjs';
export const id = 'engineering/T1414';
export const tests = ['engineering/F94'];
export const title = 'no gate job sets GITHUB_SHA or GITHUB_REF, so the judge asks about the event\'s own sha and ref';
export async function run() {
  const text = readFileSync(src, 'utf8');
  assert.ok(!/^\s*GITHUB_(SHA|REF):/m.test(text.split(/\njobs:/)[0]), 'the workflow environment sets GITHUB_SHA or GITHUB_REF');
  for (const { name, job } of gateJobs(text)) {
    assert.ok(job, `no job named ${name}`);
    assert.ok(!/^\s*GITHUB_(SHA|REF):/m.test(job), `${name} sets GITHUB_SHA or GITHUB_REF`);
  }
}
