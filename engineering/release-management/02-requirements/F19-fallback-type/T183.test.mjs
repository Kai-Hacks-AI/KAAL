// Case release/T183 tests: F18. Amended in release/C138: F18 defers to F19 for what DEFAULT is, which is no longer a TYPE.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T183';
export const tests = ['release/F18'];
export const title = 'F18 defers to F19 for DEFAULT, says it declares no TYPE and carries no declaration line, and does not call DEFAULT a TYPE';
export function run() {
  const text = read(join(cap, '02-requirements/F18-fallback-interface/F18.md'), 'F18');
  assert.match(text, /release\/F19/, 'F18 does not point to F19');
  assert.doesNotMatch(text, /DEFAULT is the name of the fallback TYPE/, 'F18 still calls DEFAULT a TYPE');
  assert.doesNotMatch(text, /declares itself with `<!-- KAAL-PR-template: DEFAULT -->`/, 'F18 still has the fallback declare DEFAULT');
}
