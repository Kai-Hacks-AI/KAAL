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
export const title = 'the Hotfix template has no chapter for what the Change, the Cases, the diff or the delivery controls already hold';
export function run() {
  const text = read(hotfix, 'the Hotfix template');
  const held = ['Correction', 'Route', 'Recovery', 'Verification', 'Evidence', 'Implementation'];
  assert.deepEqual(headings(text).filter((h) => held.includes(h)), [], 'the template has a chapter for material that is held elsewhere');
  const intro = text.split(/^## /m)[0];
  assert.ok(/Cases/.test(intro) && /diff/.test(intro), 'the template does not say that the Cases and the diff hold everything else');
}
