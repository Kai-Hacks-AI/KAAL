// Case controls/T16 tests: A6
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const read = (rel, what) => { const path = join(pkg, rel); assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const has = (text, words, what) => { for (const w of words) assert.ok(text.toLowerCase().includes(w.toLowerCase()), `${what} does not state ${w}`); };
export const id = 'controls/T16';
export const tests = ['controls/A6'];
export const title = 'the Controls Node is typed by KAAL Capability and the Control Definition by KAAL Definition';
export function run() {
  const node = read('capability/Controls.md', 'the Controls Node'); const def = read('payload/Control.md', 'the Control Definition');
  assert.match(node, /name: KAAL Capability/); assert.match(def, /name: KAAL Definition/);
}
