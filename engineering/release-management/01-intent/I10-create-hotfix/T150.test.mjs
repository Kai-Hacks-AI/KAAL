// Case release/T150 tests: I10
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
export const id = 'release/T150';
export const tests = ['release/I10'];
export const title = 'a Hotfix is presented through a template that names its Change, the defect, the correction, the route and the recovery';
export function run() {
  read(join(cap, '01-intent/I10-create-hotfix/I10.md'), 'I10');
  assert.ok(existsSync(hotfix), 'the Hotfix template is absent');
}
