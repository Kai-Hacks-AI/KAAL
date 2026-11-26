// Case engineering/T1415 tests: engineering/F95
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { src } from './fixture.mjs';
export const id = 'engineering/T1415';
export const tests = ['engineering/F95'];
export const title = 'the workflow runs on pull_request and merge_group only, reads contents only, holds no token or secret, and the job is verify Workflow names';
export async function run() {
  const text = readFileSync(src, 'utf8');
  const on = text.split(/\njobs:/)[0].match(/\non:\n((?:\s{2,}.*\n?)+)/)?.[1] ?? '';
  const triggers = [...on.matchAll(/^ {2}([a-z_]+):/gm)].map((m) => m[1]).sort();
  assert.deepEqual(triggers, ['merge_group', 'pull_request'], `the triggers are ${triggers.join(', ')}`);
  const perms = text.match(/^permissions:\n((?:\s{2,}.+\n?)+)/m)?.[1].split('\n').map((l) => l.trim()).filter(Boolean);
  assert.deepEqual(perms, ['contents: read'], 'the permissions are not contents: read only');
  assert.ok(!/secrets\.|GITHUB_TOKEN|github\.token|pull_request_target/.test(text), 'a token, a secret or pull_request_target appears');
  assert.match(text, /^\s{4}name: verify Workflow names\s*$/m, 'the job is not named verify Workflow names');
}
