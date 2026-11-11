// Case controls/T15 tests: A5
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const read = (rel, what) => { const path = join(pkg, rel); assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const has = (text, words, what) => { for (const w of words) assert.ok(text.toLowerCase().includes(w.toLowerCase()), `${what} does not state ${w}`); };
export const id = 'controls/T15';
export const tests = ['controls/A5'];
export const title = 'the package kaal-controls stands in the layout of the other capabilities';
export function run() {
  for (const f of ['package.json','LICENSE','README.md','ownership.kaal.json']) read(f, f);
  assert.equal(JSON.parse(read('package.json','package.json')).name, 'kaal-controls');
  assert.ok(!existsSync(join(repo, 'packages/skills/kaal-controls')), 'the old layout is carried');
}
