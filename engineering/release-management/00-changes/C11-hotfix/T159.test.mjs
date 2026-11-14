// Case release/T159 tests: G42
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
export const id = 'release/T159';
export const tests = ['release/G42'];
export const title = 'gap release/G42 is closed: F16 and the Hotfix template are present';
export function run() {
  read(join(cap, '02-requirements/F16-hotfix-interface/F16.md'), 'F16');
  assert.ok(existsSync(hotfix), 'the Hotfix template is absent');
}
