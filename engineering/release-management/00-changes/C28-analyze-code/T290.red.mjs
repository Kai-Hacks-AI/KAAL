// Case release/T290 tests: G64
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const here = join(repo, 'engineering/release-management/00-changes/C28-analyze-code');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T290';
export const tests = ['release/G64'];
export const title = 'gap release/G64 is closed: a merge group reported both contexts, recorded as acceptance';
export function run() {
  const wf = read(join(repo, '.github/workflows/codeql.yml'), 'the CodeQL workflow');
  assert.match(wf, /merge_group:/, 'the workflow triggers on the merge group');
  const acc = read(join(here, 'acceptance.md'), 'the acceptance record');
  assert.match(acc, /CodeQL \(actions\)/, 'the record names the actions context');
  assert.match(acc, /CodeQL \(javascript-typescript\)/, 'the record names the javascript-typescript context');
  assert.match(acc, /merge group/i, 'the record states the merge group observation');
}
