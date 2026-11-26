// Case release/T1555 tests: release/C139
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1555';
export const tests = ['release/C139'];
export const title = 'the workflow source of verify Adapter is a plain pull_request judge of the default branch, behind its flag, with no token and no installation';
export async function run() {
  const file = join(repo, 'engineering/release-management/05-src/wiring/workflows/verify-adapter.yml');
  assert.ok(existsSync(file), 'the workflow source is absent');
  const code = readFileSync(file, 'utf8').split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
  assert.match(code, /^name: verify Adapter$/m);
  assert.match(code, /^\s+pull_request:$/m);
  assert.doesNotMatch(code, /pull_request_target|secrets\.|GITHUB_TOKEN|npm (ci|install)|persist-credentials: true/);
  assert.match(code, /^permissions:\n  contents: read$/m);
  assert.match(code, /KAAL_FLAG: \$\{\{ vars\.KAAL_CONTROLS_VERIFY_ADAPTER \}\}/);
  assert.match(code, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/, 'the judge is the default branch');
  assert.match(code, /path: pr/, 'the pull request is checked out as data beside the judge');
  assert.match(code, /run-verify-adapter\.mjs/);
}
