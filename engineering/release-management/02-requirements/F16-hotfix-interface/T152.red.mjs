// Case release/T152 tests: F16
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
export const id = 'release/T152';
export const tests = ['release/F16'];
export const title = 'the Defect chapter asks what is broken and which state is defective, keeps production, main and a collector apart, and forbids a claimed production impact that does not exist';
export function run() {
  const hint = chapter(read(hotfix, 'the Hotfix template'), 'Defect');
  for (const word of ['broken', 'production', 'main', 'collector']) assert.ok(hint.toLowerCase().includes(word), `the Defect hint does not mention ${word}`);
  assert.ok(/different/i.test(hint), 'the Defect hint does not say that the states differ');
  assert.ok(/claim no production impact/i.test(hint), 'the Defect hint does not forbid claiming a production impact that does not exist');
}
