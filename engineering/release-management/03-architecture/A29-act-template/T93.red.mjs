// Case release/T93 tests: A29
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const act = join(repo, '.github/PULL_REQUEST_TEMPLATE/act.md');
const plan = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T93';
export const tests = ['release/A29'];
export const title = 'the act template addresses the interface and is applied on GitHub through A30';
export function run() {
  assert.match(read(join(cap, '03-architecture/A29-act-template/A29.md'), 'A29'), /addresses: \[release\/F10\]/);
  assert.match(read(join(cap, '03-architecture/A29-act-template/A30-github/A30.md'), 'A30'), /parent: release\/A29/);
}
