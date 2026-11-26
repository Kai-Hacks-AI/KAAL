// Case release/T187 tests: G52. Amended in release/C138: DEFAULT is not a TYPE and is never in the registry; it is an invalid route (release/F19).
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T187';
export const tests = ['release/G52'];
export const title = 'F17 and A40 state that DEFAULT is an invalid route and never in the registry';
export function run() {
  const f17 = read(join(cap, '02-requirements/F17-envelope-rules/F17.md'), 'F17');
  assert.doesNotMatch(f17, /DEFAULT is a TYPE/, 'F17 still states that DEFAULT is a TYPE');
  assert.match(f17, /DEFAULT, an invalid route/, 'F17 does not state that DEFAULT is an invalid route');
  assert.match(f17, /never in the registry/, 'F17 does not keep DEFAULT out of the registry');
  const a40 = read(join(cap, '03-architecture/A1-verify-plan/A2-github/A5-actions/A6-check-job/A33-check-pr-envelope/A40-template-reader/A40.md'), 'A40');
  assert.match(a40, /DEFAULT is invalid/, 'A40 does not say that DEFAULT is invalid');
  assert.doesNotMatch(a40, /registers DEFAULT/, 'A40 still says that the reader registers DEFAULT');
}
