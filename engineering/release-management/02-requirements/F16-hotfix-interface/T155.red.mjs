// Case release/T155 tests: F16
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
export const id = 'release/T155';
export const tests = ['release/F16'];
export const title = 'the Recovery chapter asks how main and production return to what they were';
export function run() {
  const hint = chapter(read(hotfix, 'the Hotfix template'), 'Recovery');
  assert.ok(/wrong/i.test(hint), 'the Recovery hint does not say when recovery applies');
  assert.ok(/main/i.test(hint) && /previous/i.test(hint), 'the Recovery hint does not ask how main and production go back');
}
