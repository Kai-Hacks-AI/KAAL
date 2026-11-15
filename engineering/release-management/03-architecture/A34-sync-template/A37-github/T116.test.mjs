// Case release/T116 tests: A37
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const text = join(cap, '03-architecture/A34-sync-template/sync-template.md');
const installed = join(repo, '.github/PULL_REQUEST_TEMPLATE/sync.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T116';
export const tests = ['release/A37'];
export const title = 'A37 github is present, names the installed path and says the text is installed unchanged';
export function run() {
  const a37 = read(join(cap, '03-architecture/A34-sync-template/A37-github/A37.md'), 'A37');
  assert.ok(a37.includes('.github/PULL_REQUEST_TEMPLATE/sync.md') && /unchanged/.test(a37), 'A37 does not name the installed path and the unchanged text');
}
