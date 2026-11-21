// Case release/T1322 tests: release/I50
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T1322';
export const tests = ['release/I50'];
export const title = 'the source of the admission to the merge queue runs on pull_request, holds no permission and reads nothing, and keeps its check name';
export async function run() {
  const file = join(RM, '05-src/wiring/workflows/merge-group-admission.yml');
  assert.ok(existsSync(file), 'the source merge-group-admission.yml is absent');
  const { uses } = await import(pathToFileURL(join(RM, '05-src/triggers/verify-triggers.mjs')).href);
  const raw = readFileSync(file, 'utf8');
  const wf = raw.replace(/^\s*#.*$/gm, '');
  assert.equal(uses(raw), false, 'the source uses pull_request_target');
  assert.match(wf, /^on:\n  pull_request:\n    types: \[opened, synchronize, reopened, ready_for_review\]\n/m, 'it triggers only on pull_request');
  assert.doesNotMatch(wf, /pull_request_target|merge_group|workflow_dispatch|workflow_run/, 'no other trigger');
  assert.equal([...wf.matchAll(/^\s*permissions:\s*\{\}\s*$/gm)].length, 2, 'permissions: {} on the file and on the job');
  assert.doesNotMatch(wf, /permissions:\n\s+\w/, 'no permission is granted');
  assert.match(wf, /\n    name: Change Isolation \(review\)\n/, 'the job keeps the required context name');
  assert.doesNotMatch(wf, /\buses:|actions\/checkout|secrets\.|GH_TOKEN|github\.token|\$\{\{ *github\.(event|head_ref)/, 'no action, checkout, secret, token or event data');
  assert.match(wf, /not an attestation/, 'the notice says it is not an attestation');
}
