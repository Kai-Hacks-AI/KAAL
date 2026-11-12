// Case release/T177 tests: A42
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const fallback = join(repo, '.github/pull_request_template.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T177';
export const tests = ['release/A42'];
export const title = 'A42 is the default pull request template, the single default file GitHub names, outside the specialized directory';
export function run() {
  read(join(cap, '03-architecture/A41-fallback-template/A42-github/A42.md'), 'A42');
  assert.match(read(fallback, 'the default template'), /fallback/i, 'the default template does not say that it is the fallback');
  assert.deepEqual(['pull_request_template.md', 'PULL_REQUEST_TEMPLATE.md'].filter((name) => existsSync(join(repo, name)) || existsSync(join(repo, 'docs', name))), [], 'a second default file stands in the root or docs');
}
