// Case release/T157 tests: A39
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const dir = join(repo, '.github/PULL_REQUEST_TEMPLATE');
const hotfix = join(dir, 'hotfix.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
const chapter = (text, name) => (text.split(new RegExp(`^## ${name}$`, 'm'))[1] ?? '').split(/^## /m)[0];
export const id = 'release/T157';
export const tests = ['release/A39'];
export const title = 'the Hotfix template stands where GitHub offers it, and A39 is a child of A36';
export function run() {
  const text = read(join(cap, '03-architecture/A36-create-hotfix/A39-github/A39.md'), 'A39');
  assert.ok(/parent: release\/A36/.test(text), 'A39 is not a child of A36');
  assert.ok(existsSync(hotfix), 'the Hotfix template is absent');
}
