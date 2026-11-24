// Case engineering/T1423 tests: engineering/F96
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { src } from '../F95-workflow-names-workflow/fixture.mjs';
export const id = 'engineering/T1423';
export const tests = ['engineering/F96'];
export const title = 'the one checkout is of the default branch, without credentials, and not of the base or the head';
export async function run() {
  const text = readFileSync(src, 'utf8');
  const checkouts = [...text.matchAll(/^\s*(?:- )?uses: actions\/checkout@.*\n((?:\s{8,}.+\n?)*)/gm)];
  assert.equal(checkouts.length, 1, 'there is not exactly one checkout');
  const w = checkouts[0][1];
  assert.match(w, /^\s*ref:\s*\$\{\{\s*github\.event\.repository\.default_branch\s*\}\}\s*$/m, 'the checkout is not of the default branch');
  assert.match(w, /^\s*persist-credentials:\s*false\s*$/m, 'the checkout persists credentials');
  assert.ok(!/base\.sha|base_sha|pull_request\.head|refs\/pull|merge_group\.head/.test(w), 'the checkout names the base or the head');
}
