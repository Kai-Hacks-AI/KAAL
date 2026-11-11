// Case controls/T9 tests: F10
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const read = (rel, what) => { const path = join(pkg, rel); assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const has = (text, words, what) => { for (const w of words) assert.ok(text.toLowerCase().includes(w.toLowerCase()), `${what} does not state ${w}`); };
export const id = 'controls/T9';
export const tests = ['controls/F10'];
export const title = 'the Controls Node states four classes, the verb of each, the three verdicts and that UNKNOWN never passes';
export function run() {
  const node = read('capability/Controls.md', 'the Controls Node');
  has(node, ['directive','preventive','detective','corrective'], 'the Controls Node');
  has(node, ['guard','freeze','verify','clear','drain','direct'], 'the Controls Node (the verbs)');
  has(node, ['PASS','FAIL','UNKNOWN'], 'the Controls Node (the verdicts)');
  assert.match(node, /UNKNOWN never passes/, 'the Controls Node does not state that UNKNOWN never passes');
}
