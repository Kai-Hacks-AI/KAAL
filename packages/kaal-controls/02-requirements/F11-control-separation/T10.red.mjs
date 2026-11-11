// Case controls/T10 tests: F11
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const read = (rel, what) => { const path = join(pkg, rel); assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const has = (text, words, what) => { for (const w of words) assert.ok(text.toLowerCase().includes(w.toLowerCase()), `${what} does not state ${w}`); };
export const id = 'controls/T10';
export const tests = ['controls/F11'];
export const title = 'the Controls Node separates control, mechanism and enforcement, and names the four places';
export function run() {
  const node = read('capability/Controls.md', 'the Controls Node');
  has(node, ['mechanism','enforcement'], 'the Controls Node');
  has(node, ['Development','Integration','Promotion','Publishing'], 'the Controls Node (the places)');
  assert.match(node, /preventive at a place only where/i, 'the Controls Node does not state that a control is preventive at a place only where it is enforced');
}
