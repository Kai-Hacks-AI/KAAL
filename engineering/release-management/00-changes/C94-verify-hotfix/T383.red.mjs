// Case release/T383 tests: release/F71 (the workflow source)
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const MOD = join(RM, '05-src/hotfix/verify-hotfix.mjs');
const load = () => import(pathToFileURL(MOD).href);
const draft = (name) => readFileSync(join(RM, '00-changes/C94-verify-hotfix/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T383';
export const tests = ['release/F71', 'release/A66'];
export const title = 'the workflow source equals its draft: plain pull_request into hotfix/**, read-only, no secret, the base commit checked out with no stored credential, the head fetched from its pull request ref, the body written from the environment and never into script text, only the base judge run';
export async function run() {
  const real = join(RM, '05-src/wiring/workflows/verify-hotfix.yml');
  assert.ok(existsSync(real), 'the workflow source is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('verify-hotfix.yml')}\n`, 'the workflow differs from its draft');
  assert.match(t, /^on:\n  pull_request:\n    branches: \['hotfix\/\*\*'\]/m);
  assert.doesNotMatch(t, /pull_request_target/, 'the check must not use pull_request_target');
  assert.match(t, /permissions:\n  contents: read/);
  assert.doesNotMatch(t, /secrets\./);
  assert.match(t, /ref: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/, 'the checkout is not the base commit');
  assert.doesNotMatch(t, /github\.head_ref|pull_request\.head\.(ref|sha)/, 'the head is read by its pull request ref only');
  assert.match(t, /fetch-depth: 0/);
  assert.match(t, /persist-credentials: false/);
  assert.match(t, /git fetch --no-tags origin "\+refs\/pull\/\$\{PR_NUMBER\}\/head:refs\/remotes\/pull\/head"/);
  assert.match(t, /PR_BODY: \$\{\{ github\.event\.pull_request\.body \}\}/);
  const script = t.split('run: |').slice(1).join('\n');
  assert.doesNotMatch(script, /\$\{\{/, 'an expression inside script text lets a pull request body run as code');
  assert.match(t, /printf '%s' "\$PR_BODY" > "\$RUNNER_TEMP\/body\.md"/);
  assert.match(t, /--head refs\/remotes\/pull\/head/);
  assert.match(t, /UNKNOWN: the judge is absent on the base[\s\S]*exit 2/);
}
