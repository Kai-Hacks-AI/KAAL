// Case release/T187 tests: G52
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T187';
export const tests = ['release/G52'];
export const title = 'gap release/G52 is closed: F17 and A40 state that DEFAULT is a TYPE in the registry';
export function run() {
  const f17 = read(join(cap, '02-requirements/F17-envelope-rules/F17.md'), 'F17');
  assert.match(f17, /DEFAULT is a TYPE/, 'F17 does not state that DEFAULT is a TYPE');
  assert.match(f17, /DEFAULT: <description>/, 'F17 does not give the title of a DEFAULT pull request');
  assert.doesNotMatch(f17, /never in the registry/, 'F17 still keeps DEFAULT out of the registry');
  assert.doesNotMatch(f17, /not a seventh specialized type/, 'F17 still says that DEFAULT is not a TYPE');
  const a40 = read(join(cap, '03-architecture/A1-verify-plan/A2-github/A5-actions/A6-check-job/A33-check-pr-envelope/A40-template-reader/A40.md'), 'A40');
  assert.match(a40, /registers DEFAULT/, 'A40 does not say that the reader registers DEFAULT');
}
