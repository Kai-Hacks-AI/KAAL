// Case release/T181 tests: G48
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const fallback = join(repo, '.github/pull_request_template.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T181';
export const tests = ['release/G48'];
export const title = 'gap release/G48 is closed: A42 is present and the default template is the fallback, declared DEFAULT, with the chapters Change and Because';
export function run() {
  read(join(cap, '03-architecture/A41-fallback-template/A42-github/A42.md'), 'A42');
  const text = read(fallback, 'the default template');
  assert.match(text, /^\s*<!--\s*KAAL-PR-template:\s*DEFAULT\s*-->/, 'the default template does not start with the DEFAULT declaration');
  assert.deepEqual(headings(text), ['Change', 'Because']);
}
