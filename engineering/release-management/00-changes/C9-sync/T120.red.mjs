// Case release/T120 tests: G37
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/sync.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T120';
export const tests = ['release/G37'];
export const title = 'gap release/G37 is closed: A34, A37 and the SYNC template are present';
export function run() {
  read(join(cap, '03-architecture/A34-sync-template/A34.md'), 'A34');
  read(join(cap, '03-architecture/A34-sync-template/A37-github/A37.md'), 'A37');
  read(template, 'the SYNC template');
}
