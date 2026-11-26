// Case release/T946 tests: release/C73
import assert from 'node:assert/strict';
import { read, code, WORKFLOW } from './fixtures.mjs';
export const id = 'release/T946';
export const tests = ['release/C73'];
export const title = 'the workflow source runs only from the default branch, mints the App token only in the job that reads no collector, and pins every action to a commit';
export async function run() {
  const raw = read(WORKFLOW);
  assert.ok(raw, 'dispatcher.yml is absent');
  const y = code(raw);
  const on = /^on:\n([\s\S]*?)^\S/m.exec(y + '\nend');
  assert.ok(on, 'no trigger block');
  assert.ok(/workflow_dispatch:/.test(on[1]) && !/schedule:/.test(on[1]), 'it is not manual only (release/C93: the scan has no schedule)');
  assert.ok(!/pull_request|push:|workflow_run|issue_comment/.test(on[1]), 'it has a trigger that a candidate can start');
  assert.match(y, /^permissions: \{\}$/m, 'no empty set of permissions at the top');
  const job = (n) => y.split(/^  (?=[a-z]+:\n    name: )/m).find((j) => j.includes(`name: ${n}`));
  const decide = job('decide Dispatch'), raise = job('raise Dispatch');
  assert.ok(decide && raise, 'a job is absent');
  assert.ok(!/create-github-app-token|KAAL_DISPATCHER_KEY|DISPATCHER_APP_ID/.test(decide), 'the job that reads holds the App');
  assert.ok(/contents: read/.test(decide) && /pull-requests: read/.test(decide) && !/write/.test(decide), 'the job that reads can write');
  assert.ok(/create-github-app-token/.test(raise) && raise.includes('KAAL_DISPATCHER_KEY') && raise.includes('vars.KAAL_DISPATCHER_APP_ID'), 'the job that raises does not mint the App token from the key and the App ID');
  assert.match(raise, /^    permissions: \{\}$/m, 'the job that raises holds a workflow token');
  assert.ok(!/matching-refs|compare\/|gatherFacts|git fetch|git checkout|refs\/pull|refs\/heads/.test(raise), 'the job that raises reads a collector');
  assert.ok(raise.includes('KAAL_DISPATCH_RAISE') && raise.includes('vars.KAAL_DISPATCH_RAISE'), 'the raise is not switched by the variable');
  assert.ok(raise.includes('needs: decide') || /needs: \[?decide/.test(raise), 'raise does not take the decision from decide');
  for (const m of y.matchAll(/uses: ([^\s@]+)@(\S+)/g)) assert.match(m[2], /^[0-9a-f]{40}$/, `${m[1]} is not pinned to a commit`);
  assert.ok(!/\$\{\{ *github\.event\.(pull_request|issue)/.test(y), 'an event field of a candidate is interpolated');
}
