// Case release/T173 tests: F18
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CUE } from '../../05-src/plan-body/cue.mjs';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const fallback = join(cap, '03-architecture/A41-fallback-template/fallback-template.md');
const typedDir = join(repo, '.github/PULL_REQUEST_TEMPLATE');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
const typed = () => (existsSync(typedDir) ? readdirSync(typedDir).filter((name) => name.endsWith('.md')) : []);
export const id = 'release/T173';
export const tests = ['release/F18'];
export const title = 'the fallback template has two chapters, Change and Because, each with a hint, and no visible text beyond the headings and the Change envelope cue, no link and no emoji';
export function run() {
  read(join(cap, '02-requirements/F18-fallback-interface/F18.md'), 'F18');
  const text = read(fallback, 'the fallback template');
  assert.deepEqual(headings(text), ['Change', 'Because']);
  const chapters = text.split(/^## .*$/m).slice(1);
  assert.deepEqual(chapters.map((part) => /<!--[\s\S]*?-->/.test(part)), [true, true], 'every chapter carries a hint');
  const visible = text.split(/<!--[\s\S]*?-->/).join('').split('\n').filter((line) => line.trim() !== '');
  // The Change envelope cue (release/C24) is the one visible line allowed beside the headings.
  assert.ok(visible.every((line) => line.startsWith('## ') || line === CUE), 'the template shows text beyond its headings');
  assert.ok(!/https?:\/\//.test(text), 'the template holds a link');
  assert.ok(!/\p{Extended_Pictographic}/u.test(text), 'the template holds an emoji');
}
