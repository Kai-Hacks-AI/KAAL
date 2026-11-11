// Case release/T100 tests: A31
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const doTemplate = join(repo, '.github/PULL_REQUEST_TEMPLATE/do.md');
const planTemplate = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T100';
export const tests = ['release/A31'];
export const title = 'the do template addresses the interface and is applied on GitHub through A32';
export function run() {
  assert.match(read(join(cap, '03-architecture/A31-do-template/A31.md'), 'A31'), /addresses: \[release\/F11\]/);
  assert.match(read(join(cap, '03-architecture/A31-do-template/A32-github/A32.md'), 'A32'), /parent: release\/A31/);
}
