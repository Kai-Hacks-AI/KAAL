// Case release/T175 tests: A41
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const fallback = join(repo, '.github/pull_request_template.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T175';
export const tests = ['release/A41'];
export const title = 'the fallback identifies itself: A41 addresses F18, A42 is its parent, and the default file declares DEFAULT and has a leading comment that calls it the fallback for a pull request without a specialized template';
export function run() {
  assert.match(read(join(cap, '03-architecture/A41-fallback-template/A41.md'), 'A41'), /addresses: \[release\/F18\]/);
  assert.match(read(join(cap, '03-architecture/A41-fallback-template/A42-github/A42.md'), 'A42'), /parent: release\/A41/);
  const text = read(fallback, 'the fallback template');
  assert.match(text, /^\s*<!--\s*KAAL-PR-template:\s*DEFAULT\s*-->/, 'the file does not start with the DEFAULT declaration');
  const lead = text.split(/^## /m)[0].split(/<!--\s*KAAL-PR-template:[^>]*-->/).join('');
  assert.match(lead, /<!--[\s\S]*?fallback[\s\S]*?-->/i, 'the leading comment does not call the template the fallback');
  assert.match(lead, /<!--[\s\S]*?specialized[\s\S]*?-->/i, 'the leading comment does not point to the specialized templates');
}
