// Case release/T175 tests: A41
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const fallback = join(cap, '03-architecture/A41-fallback-template/fallback-template.md');
const typedDir = join(repo, '.github/PULL_REQUEST_TEMPLATE');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
const typed = () => (existsSync(typedDir) ? readdirSync(typedDir).filter((name) => name.endsWith('.md')) : []);
export const id = 'release/T175';
export const tests = ['release/A41'];
export const title = 'the fallback identifies itself: A41 addresses F18 and holds the fallback template, which declares DEFAULT and has a leading comment that calls it the fallback for a pull request without a specialized template';
export function run() {
  assert.match(read(join(cap, '03-architecture/A41-fallback-template/A41.md'), 'A41'), /addresses: \[release\/F18\]/);
  const text = read(fallback, 'the fallback template');
  assert.match(text, /^\s*<!--\s*KAAL-PR-template:\s*DEFAULT\s*-->/, 'the file does not start with the DEFAULT declaration');
  const lead = text.split(/^## /m)[0].split(/<!--\s*KAAL-PR-template:[^>]*-->/).join('');
  assert.match(lead, /<!--[\s\S]*?fallback[\s\S]*?-->/i, 'the leading comment does not call the template the fallback');
  assert.match(lead, /<!--[\s\S]*?specialized[\s\S]*?-->/i, 'the leading comment does not point to the specialized templates');
}
