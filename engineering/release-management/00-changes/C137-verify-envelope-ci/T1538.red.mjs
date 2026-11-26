// Case release/T1538 tests: release/C137
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1538';
export const tests = ['release/C137'];
export const title = 'the workflow source of verify Envelope is a plain pull_request judge of the default branch, behind its flag, with no token and no installation';
export async function run() {
  const file = join(repo, 'engineering/release-management/05-src/wiring/workflows/verify-envelope.yml');
  assert.ok(existsSync(file), 'the workflow source is absent');
  const y = readFileSync(file, 'utf8');
  const code = y.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
  assert.match(code, /^name: verify Envelope$/m);
  assert.match(code, /^\s+pull_request:$/m);
  assert.doesNotMatch(code, /pull_request_target|secrets\.|GITHUB_TOKEN|npm (ci|install)|persist-credentials: true/);
  assert.match(code, /^permissions:\n  contents: read$/m);
  assert.match(code, /KAAL_FLAG: \$\{\{ vars\.KAAL_RELEASE_VERIFY_ENVELOPE \}\}/);
  assert.match(code, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/, 'the judge is the default branch');
  assert.match(code, /run-verify-envelope\.mjs/);
  assert.ok(!/ref: .*head\.(ref|sha)/.test(code), 'the head must never be checked out to run');
}
