// Case engineering/T1570 tests: engineering/F99
import assert from 'node:assert/strict';
import { load } from './fixture.mjs';
export const id = 'engineering/T1570';
export const tests = ['engineering/F99'];
export const title = 'the producing job is reusable, read-only, without secrets, and reads the pull request only as data, installing only the default-branch tool';
export async function run() {
  const y = load();
  assert.ok(/^on:\s*\n\s+workflow_call:/m.test(y), 'it must be workflow_call');
  assert.ok(!/pull_request_target|workflow_run/.test(y), 'no pull_request_target or workflow_run');
  assert.ok(/permissions:\s*\n\s+contents:\s*read/.test(y), 'permissions: contents: read');
  assert.ok(!/secrets\./.test(y), 'no secret');
  assert.ok(/ref:\s*\$\{\{\s*github\.event\.repository\.default_branch\s*\}\}/.test(y), 'the tool comes from the default branch');
  assert.ok(/path:\s*pr\b/.test(y), 'the merge result sits under pr');
  assert.equal((y.match(/persist-credentials:\s*false/g) ?? []).length, (y.match(/actions\/checkout@/g) ?? []).length, 'every checkout drops credentials');
  assert.ok(!/npm (ci|install)[^\n]*\bpr\b|working-directory:\s*pr\b[\s\S]{0,80}npm (ci|install)/.test(y), 'nothing is installed from pr');
  for (const m of y.match(/npm (ci|install)[^\n]*/g) ?? []) assert.ok(m.includes('--ignore-scripts'), 'install without scripts');
}
