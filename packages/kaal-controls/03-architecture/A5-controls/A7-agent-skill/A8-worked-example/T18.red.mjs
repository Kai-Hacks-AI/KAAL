// Case controls/T18 tests: A8
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const read = (rel, what) => { const path = join(pkg, rel); assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const has = (text, words, what) => { for (const w of words) assert.ok(text.toLowerCase().includes(w.toLowerCase()), `${what} does not state ${w}`); };
export const id = 'controls/T18';
export const tests = ['controls/A8'];
export const title = 'the worked example shows detection against prevention, the verdicts, two places and responsibility against machinery';
export function run() {
  const ex = read('skills/kaal-controls/references/verify-dependencies.md', 'the worked example');
  has(ex, ['detective','preventive','PASS','FAIL','UNKNOWN','Integration','Promotion','mechanism','responsib'], 'the worked example');
}
