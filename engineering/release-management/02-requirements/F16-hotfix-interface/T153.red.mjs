// Case release/T153 tests: F16
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
export const id = 'release/T153';
export const tests = ['release/F16'];
export const title = 'the Correction chapter states the boundary: what is changed, what is left out, and no refactoring';
export function run() {
  const hint = chapter(read(hotfix, 'the Hotfix template'), 'Correction');
  assert.ok(/leaves out|not include|excludes/i.test(hint), 'the Correction hint does not ask for what is left out');
  assert.ok(/refactor/i.test(hint), 'the Correction hint does not rule out refactoring');
  assert.ok(/unrelated/i.test(hint), 'the Correction hint does not rule out unrelated work');
}
