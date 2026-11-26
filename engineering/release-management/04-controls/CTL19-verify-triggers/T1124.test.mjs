// Case release/T1124 tests: release/F67
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const MOD = join(RM, '05-src/triggers/verify-triggers.mjs');
const load = () => import(pathToFileURL(MOD).href);
const draft = (name) => readFileSync(join(RM, '00-changes/C90-no-pull-request-target/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1124';
export const tests = ['release/F67'];
export const title = 'the workflow source runs on plain pull_request, reads the base commit and the head ref as Git data, runs only the judge of the default branch, with no secret and no pull_request_target';
export async function run() {
  const { uses } = await load();
  const real = join(RM, '05-src/wiring/workflows/verify-triggers.yml');
  assert.ok(existsSync(real), 'the workflow source is absent');
  const t = readFileSync(real, 'utf8');
  // the equality with the draft of release/C90 is superseded: release/C91 amends the source for merge_group, and release/T1134 holds the source to its own draft
  assert.equal(uses(t), false, 'the check must not use pull_request_target itself');
  assert.match(t, /^on:\n  pull_request:/m);
  assert.match(t, /permissions:\n  contents: read/);
  assert.doesNotMatch(t, /secrets\./);
  assert.match(t, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/, 'the checkout is not the default branch (release/C132)');
  assert.doesNotMatch(t, /ref: \$\{\{ github\.event\.pull_request\.head/, 'a checkout of the pull request head would run its code');
  assert.doesNotMatch(t, /github\.head_ref|pull_request\.head\.(ref|sha)/, 'the head is read by its pull request ref only');
  assert.match(t, /fetch-depth: 0/);
  assert.match(t, /persist-credentials: false/);
  assert.match(t, /git fetch --no-tags origin "\+refs\/pull\/\$\{PR_NUMBER\}\/head:refs\/remotes\/pull\/head"/, 'the head is not fetched from its pull request ref');
  assert.match(t, /--head refs\/remotes\/pull\/head/);
  assert.match(t, /UNKNOWN: the judge is absent on the default branch[\s\S]*exit 2/);
}
