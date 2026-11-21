// Case release/T1328 tests: release/F70
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO } from './tree-fixtures.mjs';
export const id = 'release/T1328';
export const tests = ['release/F70'];
export const title = 'the workflow reads the collector as data: a second checkout without credentials, nothing of it installed or run, and the job that holds the token reads none';
export async function run() {
  const text = readFileSync(join(REPO, 'engineering/release-management/05-src/wiring/workflows/dispatcher-raise.yml'), 'utf8');
  const jobs = text.split(/^jobs:\n/m)[1].split(/^  (?=raise:)/m);
  const [classify, raise] = jobs;
  const steps = (j) => j.split(/^      - /m).slice(1);
  const checkouts = steps(classify).filter((s) => /uses: actions\/checkout@/.test(s));
  assert.equal(checkouts.length, 2, 'the default branch and the collector');
  const data = checkouts.find((s) => /path: collector/.test(s));
  assert.ok(data, 'the collector goes to its own folder');
  assert.match(data, /ref: \$\{\{ github\.event\.pull_request\.merge_commit_sha \}\}/);
  assert.match(data, /persist-credentials: false/);
  assert.match(data, /fetch-depth: 2/);
  assert.ok(checkouts.every((s) => /persist-credentials: false/.test(s)), 'no checkout keeps credentials');
  const runs = steps(classify).filter((s) => /^\s*run:|\n\s*run:/.test(s)).join('\n');
  assert.ok(!/npm|yarn|pnpm|\bcd collector|collector\//.test(runs.replace(/KAAL_COLLECTOR_DIR/g, '')), 'nothing of the collector is installed or run');
  assert.ok(!/collector/.test(raise ?? ''), 'the job that holds the token reads no collector');
  assert.ok(!/pull_request_target/.test(text.replace(/^#.*$/gm, '')), 'the event is pull_request, never pull_request_target');
}
