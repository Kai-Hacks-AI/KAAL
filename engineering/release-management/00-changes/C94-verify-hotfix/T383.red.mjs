// Case release/T383 tests: release/F71, release/A66 (the workflow source)
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
export const title = 'the workflow source equals its draft: plain pull_request into hotfix/**, read-only, no secret; the Cases run in one job and the judge in a clean job from the base commit, with the head from its pull request ref, the runs downloaded as data and the body from the environment and never in script text';
export async function run() {
  const real = join(RM, '05-src/wiring/workflows/verify-hotfix.yml');
  assert.ok(existsSync(real), 'the workflow source is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('verify-hotfix.yml')}\n`, 'the workflow differs from its draft');
  assert.match(t, /^on:\n  pull_request:\n    branches: \['hotfix\/\*\*'\]/m);
  assert.doesNotMatch(t, /pull_request_target/, 'the check must not use pull_request_target');
  assert.match(t, /permissions:\n  contents: read/);
  assert.doesNotMatch(t, /secrets\./);
  assert.doesNotMatch(t, /ref: \$\{\{ github\.event\.pull_request\.head/, 'a checkout of the pull request head would run its code in the job that judges');
  assert.doesNotMatch(t, /github\.head_ref|pull_request\.head\.(ref|sha)/, 'the head is read by its pull request ref only');
  const [, runJob, judgeJob] = t.split(/^  (?:run-hotfix-cases|verify-hotfix):$/m);
  assert.ok(runJob && judgeJob, 'the source has not the two jobs run-hotfix-cases and verify-hotfix');
  assert.match(t, /^  run-hotfix-cases:\n    name: run Hotfix Cases/m);
  assert.match(t, /^  verify-hotfix:\n    name: verify Hotfix\n    needs: run-hotfix-cases\n    if: \$\{\{ !cancelled\(\) \}\}/m, 'the judge is not a clean job that needs the run and reports when the run failed');
  for (const [name, job] of [['run', runJob], ['judge', judgeJob]]) {
    assert.match(job, /ref: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/, `the ${name} job does not check out the base commit`);
    assert.match(job, /fetch-depth: 0/);
    assert.match(job, /persist-credentials: false/);
    assert.match(job, /git fetch --no-tags origin "\+refs\/pull\/\$\{PR_NUMBER\}\/head:refs\/remotes\/pull\/head"/, `the ${name} job does not fetch the head from its pull request ref`);
    assert.match(job, /PR_BODY: \$\{\{ github\.event\.pull_request\.body \}\}/);
    assert.match(job, /node-version: 24/, `the ${name} job does not use Node 24, which the Run of Cases requires`);
    const script = [...job.matchAll(/run: \|\n((?: {10}.*\n?)+)/g)].map((m) => m[1]).join('\n');
    assert.ok(script.length > 0, `the ${name} job has no script`);
    assert.doesNotMatch(script, /\$\{\{/, `an expression inside script text of the ${name} job lets a pull request body run as code`);
    assert.match(job, /printf '%s' "\$PR_BODY" > "\$RUNNER_TEMP\/body\.md"/);
  }
  // The Cases are run in the first job, never in the judge's.
  assert.match(runJob, /kaal-testing\.mjs/);
  assert.match(runJob, /node "\$J" run --on "\$T"/);
  assert.match(runJob, /actions\/upload-artifact@[0-9a-f]{40}/);
  assert.match(runJob, /git worktree add --detach "\$RUNNER_TEMP\/baseline" "refs\/remotes\/origin\/\$\{DEFAULT_BRANCH\}"/, 'the baseline is not the default branch');
  assert.match(runJob, /git worktree add --detach "\$RUNNER_TEMP\/head" refs\/remotes\/pull\/head/);
  assert.doesNotMatch(judgeJob, /kaal-testing|npm ci|worktree|upload-artifact/, 'the judge job runs code of the pull request or builds');
  assert.match(judgeJob, /actions\/download-artifact@[0-9a-f]{40}/);
  assert.match(judgeJob, /--baseline-run "\$RUNNER_TEMP\/runs\/baseline\.json" --head-run "\$RUNNER_TEMP\/runs\/head\.json"/);
  assert.match(judgeJob, /UNKNOWN: the judge is absent on the base[\s\S]*exit 2/);
}
