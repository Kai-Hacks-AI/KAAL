// Case release/T132 tests: A35
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/promotion.md');
const planTemplate = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T132';
export const tests = ['release/A35'];
export const title = 'A35 promotion template is present and addresses F15';
export function run() {
  const text = read(join(cap, '03-architecture/A35-promotion-template/A35.md'), 'A35');
  assert.ok(/addresses: \[release\/F15\]/.test(text), 'A35 does not address F15');
}
