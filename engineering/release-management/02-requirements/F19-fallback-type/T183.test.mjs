// Case release/T183 tests: F18
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T183';
export const tests = ['release/F18'];
export const title = 'F18 no longer says that DEFAULT is not a TYPE and defers to F19 for the TYPE of the fallback';
export function run() {
  const text = read(join(cap, '02-requirements/F18-fallback-interface/F18.md'), 'F18');
  assert.doesNotMatch(text, /not a TYPE/, 'F18 still says that DEFAULT is not a TYPE');
  assert.match(text, /release\/F19/, 'F18 does not point to F19');
}
