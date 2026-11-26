// Case change/T1555 tests: change/G17
import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './T1553.red.mjs';
export const id = 'change/T1555';
export const tests = ['change/G17'];
export const closes = ['change/G17'];
export const title = 'the declaration is KAAL data: no host word, file name, comment syntax or recognition rule';
const FIELDS = ['type', 'intro', 'chapters', 'raise'];
export function run() {
  for (const t of load().types) {
    for (const k of Object.keys(t)) assert.ok(FIELDS.includes(k), t.type + ' holds the field ' + k);
    const text = JSON.stringify([t.intro, t.chapters]).toLowerCase();
    for (const w of ['github', 'pull request', '<!--', '-->', '.github', 'kaal-pr-template', '.md', 'comment'])
      assert.ok(!text.includes(w), t.type + ' names ' + w);
  }
}
test(id, () => run());
