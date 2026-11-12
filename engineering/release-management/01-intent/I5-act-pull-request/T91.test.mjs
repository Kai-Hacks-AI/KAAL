// Case release/T91 tests: I5
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const act = join(repo, '.github/PULL_REQUEST_TEMPLATE/act.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T91';
export const tests = ['release/I5'];
export const title = 'an ACT is presented through a template that names its Change and what it records';
export function run() {
  read(join(cap, '01-intent/I5-act-pull-request/I5.md'), 'I5');
  assert.ok(existsSync(act), 'the ACT template is absent');
}
