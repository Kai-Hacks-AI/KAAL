// Case release/T136 tests: G40
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
export const id = 'release/T136';
export const tests = ['release/G40'];
export const title = 'gap release/G40 is closed: A35, A38 and the promotion template are present';
export function run() {
  read(join(cap, '03-architecture/A35-promotion-template/A35.md'), 'A35');
  read(join(cap, '03-architecture/A35-promotion-template/A38-github/A38.md'), 'A38');
  read(template, 'the promotion template');
}
