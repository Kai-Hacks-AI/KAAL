// Case release/T121 tests: G48
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const text = join(cap, '03-architecture/A34-sync-template/sync-template.md');
const installed = join(repo, '.github/PULL_REQUEST_TEMPLATE/sync.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T121';
export const tests = ['release/G48'];
export const title = 'gap release/G48 is closed: A37 is present and the installed template is the capability text';
export function run() {
  read(join(cap, '03-architecture/A34-sync-template/A37-github/A37.md'), 'A37');
  assert.equal(read(installed, 'the installed SYNC template'), read(text, 'the capability text sync-template.md'));
}
