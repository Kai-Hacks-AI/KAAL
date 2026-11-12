// Case release/T115 tests: A34
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/sync.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T115';
export const tests = ['release/A34'];
export const title = 'A34 sync template is present, a directive control that enforces nothing and names its deployment target A37';
export function run() {
  const text = read(join(cap, '03-architecture/A34-sync-template/A34.md'), 'A34');
  assert.ok(/directive/.test(text) && /enforces nothing/.test(text) && /release\/A37/.test(text), 'A34 does not state a directive control, no enforcement and A37');
}
