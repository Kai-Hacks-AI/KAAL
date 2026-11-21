// Case release/T1321 tests: release/D13
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1321';
export const tests = ['release/D13'];
export const title = 'merge-group-admission.yml does not use pull_request_target';

// The reader release/CTL19 uses: a workflow uses the trigger only when its top-level on: names it.
export async function run() {
  const { uses } = await import(pathToFileURL(join(repo, 'engineering/release-management/05-src/triggers/verify-triggers.mjs')).href);
  // Both sides of a sample, so the Case can fail and can pass.
  assert.equal(uses('on:\n  pull_request_target:\n    types: [opened]\n'), true);
  assert.equal(uses('on:\n  pull_request:\n    types: [opened]\n'), false);
  const text = readFileSync(join(repo, '.github/workflows/merge-group-admission.yml'), 'utf8');
  assert.equal(uses(text), false, 'merge-group-admission.yml uses pull_request_target');
}
