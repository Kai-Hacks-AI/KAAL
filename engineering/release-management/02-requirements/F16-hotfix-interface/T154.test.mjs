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
export const title = 'the Approach chapter asks why the path is the fastest safe one from RED to GREEN, rules out improvement and refactoring, asks for the choice and not the implementation, and asks what else a new version would carry';
export function run() {
  const hint = chapter(read(hotfix, 'the Hotfix template'), 'Approach');
  assert.ok(/fastest safe/i.test(hint), 'the Approach hint does not ask for the fastest safe path');
  assert.ok(/RED/.test(hint) && /GREEN/.test(hint), 'the Approach hint does not name RED and GREEN');
  assert.ok(/refactor/i.test(hint) && /broader/i.test(hint), 'the Approach hint does not rule out a broader improvement or refactoring');
  assert.ok(/not the implementation/i.test(hint), 'the Approach hint asks for the implementation');
  assert.ok(/version/i.test(hint) && /carry/i.test(hint), 'the Approach hint does not ask what else a new version would carry');
}
