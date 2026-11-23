// Case release/T1323 tests: release/I64
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const W = join(RM, '05-src/wiring/workflows');
export const id = 'release/T1323';
export const tests = ['release/I64'];
export const title = 'Promotion Source judges from the default branch: an untrusted relay hands over a number, a handler judges and always completes the check';
const read = (n) => { const f = join(W, n); assert.ok(existsSync(f), `${n} is absent`); return readFileSync(f, 'utf8'); };
const strip = (t) => t.replace(/^\s*#.*$/gm, '');
export async function run() {
  const { uses } = await import(pathToFileURL(join(RM, '05-src/triggers/verify-triggers.mjs')).href);
  const relayRaw = read('promotion-source-relay.yml');
  const handlerRaw = read('promotion-source.yml');
  const relay = strip(relayRaw), handler = strip(handlerRaw);
  assert.equal(uses(relayRaw) || uses(handlerRaw), false, 'neither source uses pull_request_target');

  // The relay: untrusted, no permission, only the number.
  assert.match(relay, /^name: Promotion Source relay$/m);
  assert.match(relay, /^on:\n  pull_request:\n    types: \[opened, synchronize, reopened, edited\]\n/m, 'the relay triggers only on pull_request');
  assert.equal([...relay.matchAll(/^\s*permissions:\s*\{\}\s*$/gm)].length, 2, 'permissions: {} on the file and on the job');
  assert.doesNotMatch(relay, /actions\/checkout|secrets\.|GH_TOKEN|github\.token|npm |npx /, 'the relay checks out nothing, runs nothing of the pull request, holds no token');
  assert.match(relay, /upload-artifact/, 'it hands the number over as an artifact');

  // The handler: from the default branch, on the relay's completion.
  assert.match(handler, /^on:\n  workflow_run:\n    workflows: \["Promotion Source relay"\]\n    types: \[completed\]\n/m, 'the handler triggers on the relay');
  assert.doesNotMatch(handler, /pull_request:|pull_request_target|merge_group/, 'no other trigger');
  assert.match(handler, /cancel-in-progress: false/, 'a run is never cancelled mid-run');
  assert.match(handler, /\n    name: Promotion Source \(handler\)\n/, 'the job does not take the check name');
  assert.match(handler, /name="Promotion Source"/, 'the check run is named Promotion Source');
  assert.doesNotMatch(handler, /permissions:\n(\s+\S.*\n)*?\s+(contents|pull-requests|actions): write/, 'the handler writes no contents, pull requests or actions');

  // Order: in progress before anything is read or checked out.
  const at = (s) => { const i = handler.indexOf(s); assert.ok(i >= 0, `the handler lacks: ${s}`); return i; };
  const pending = at('status=in_progress');
  assert.ok(pending < at('download-artifact') && pending < at('actions/checkout') && pending < at('kaal-guard'), 'the check is set in progress before anything is read');
  assert.match(handler, /case "\$NUMBER" in ''\|\*\[!0-9\]\*\)/, 'the number is validated');
  assert.match(handler, /the relayed number \(\$RELAYED\) differs/, 'the relayed number must agree with the event');

  // Nothing of the candidate is checked out or run.
  assert.match(handler, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/, 'it checks out the default branch');
  assert.equal([...handler.matchAll(/actions\/checkout/g)].length, 1, 'one checkout only');
  assert.doesNotMatch(handler, /github\.(event\.)?(pull_request|workflow_run)\.head[._](ref|sha|repo)\b.*(checkout|ref:)|ref: \$\{\{ *github\.(event\.pull_request|head)/, 'the head is never checked out');
  assert.match(handler, /gh api "repos\/\$GITHUB_REPOSITORY\/pulls\/\$NUMBER"\)/, 'the facts are read from the API');
  assert.match(handler, /kaal-guard run --check Promotion-Source --github/, 'it runs the Promotion-Source check');

  // The last step always runs and fails unless the judgment passed.
  const last = handler.slice(at('Complete the check'));
  assert.match(last, /if: always\(\)/, 'the last step always runs');
  assert.match(last, /conclusion=failure/, 'it defaults to failure');
  assert.match(last, /\[ "\$VERDICT" = success \] && \[ "\$NOW" = "\$PENDING_HEAD" \]/, 'it passes only on a passed judgment and an unmoved head');
}
