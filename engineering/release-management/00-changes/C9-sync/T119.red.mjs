// Case release/T119 tests: G36
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/sync.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T119';
export const tests = ['release/G36'];
export const title = 'gap release/G36 is closed: F14 is present and the SYNC template has its three chapters';
export function run() {
  read(join(cap, '02-requirements/F14-sync-interface/F14.md'), 'F14');
  assert.deepEqual(headings(read(template, 'the SYNC template')), ['Sync', 'Needed by', 'Resolutions']);
}
