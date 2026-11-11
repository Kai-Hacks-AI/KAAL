// Case release/T154 tests: F16
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
export const id = 'release/T154';
export const tests = ['release/F16'];
export const title = 'the Route chapter names the new version and what it carries, and the collectors that must take the correction from main';
export function run() {
  const hint = chapter(read(hotfix, 'the Hotfix template'), 'Route');
  assert.ok(/version/i.test(hint), 'the Route hint does not ask whether a version is published');
  assert.ok(/carry/i.test(hint), 'the Route hint does not ask what else the version carries');
  assert.ok(/collectors?/i.test(hint) && /main/i.test(hint), 'the Route hint does not name the collectors that take the correction from main');
  assert.ok(!/squash|merge commit|queue/i.test(hint), 'the Route hint describes promotion or synchronization, which have their own interfaces');
}
