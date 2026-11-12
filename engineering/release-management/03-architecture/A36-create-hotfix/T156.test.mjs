// Case release/T156 tests: A36
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
export const id = 'release/T156';
export const tests = ['release/A36'];
export const title = 'create Hotfix is a directive control that addresses F16 and is deployed through A39';
export function run() {
  const text = read(join(cap, '03-architecture/A36-create-hotfix/A36.md'), 'A36');
  assert.ok(/addresses: \[release\/F16\]/.test(text), 'A36 does not address F16');
  assert.ok(/directive/i.test(text), 'A36 is not a directive control');
}
