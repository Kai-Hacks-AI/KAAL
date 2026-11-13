// Case release/T72 tests: I4
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T72';
export const tests = ['release/I4'];
export const title = 'I4 states the intent of analyze Vulnerabilities';
export function run() {
  const d = read(join(cap, '01-intent/I4-analyze-vulnerabilities/I4.md'), 'I4');
  assert.ok(d.includes('known vulnerab'), 'I4 does not state known vulnerab');
  assert.ok(d.includes('published after'), 'I4 does not state published after');
}
