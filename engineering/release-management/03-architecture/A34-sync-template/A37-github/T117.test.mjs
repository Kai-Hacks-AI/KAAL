// Case release/T117 tests: A37
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const text = join(cap, '03-architecture/A34-sync-template/sync-template.md');
const installed = join(repo, '.github/PULL_REQUEST_TEMPLATE/sync.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T117';
export const tests = ['release/A37'];
export const title = 'the SYNC template installed in GitHub is the text of the capability, byte for byte';
export function run() {
  assert.equal(read(installed, 'the installed SYNC template'), read(text, 'the capability text sync-template.md'));
}
