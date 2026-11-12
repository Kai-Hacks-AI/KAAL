// Case release/T116 tests: A37
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/sync.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T116';
export const tests = ['release/A37'];
export const title = 'A37 github is present and names the template path';
export function run() {
  const text = read(join(cap, '03-architecture/A34-sync-template/A37-github/A37.md'), 'A37');
  assert.ok(text.includes('.github/PULL_REQUEST_TEMPLATE/sync.md'), 'A37 does not name the template path');
}
