// Case release/T151 tests: F16
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
export const id = 'release/T151';
export const tests = ['release/F16'];
export const title = 'the Hotfix template has four chapters, Change, Defect, Urgency and Approach, each with a hint, and reuses no heading but Change from another pull request template';
export function run() {
  const text = read(hotfix, 'the Hotfix template');
  assert.deepEqual(headings(text), ['Change', 'Defect', 'Urgency', 'Approach']);
  const hints = text.split(/^## .*$/m).slice(1).map((part) => /<!--[\s\S]*?-->/.test(part));
  assert.deepEqual(hints, [true, true, true, true], 'every chapter carries a hint');
  const id = chapter(text, 'Change');
  assert.ok(/id/.test(id) && /name/.test(id), 'the Change hint does not ask for the id and the name');
  assert.ok(/not a description/i.test(id), 'the Change hint allows a description');
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'hotfix.md')) {
    const other = headings(read(join(dir, file), file));
    const reused = headings(text).filter((h) => h !== 'Change' && other.includes(h));
    assert.deepEqual(reused, [], `the Hotfix template reuses a heading of ${file}`);
  }
}
