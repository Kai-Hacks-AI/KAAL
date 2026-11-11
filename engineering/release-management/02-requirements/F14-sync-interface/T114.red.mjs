// Case release/T114 tests: F14
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/sync.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T114';
export const tests = ['release/F14'];
export const title = 'every chapter of the SYNC template carries a hint, Resolutions allows none, and the template holds no attribution, link or footer';
export function run() {
  const text = read(template, 'the SYNC template');
  const hints = text.split(/^## .*$/m).slice(1).map((part) => /<!--[\s\S]*?-->/.test(part));
  assert.deepEqual(hints, [true, true, true], 'every chapter carries a hint');
  assert.ok(/none/i.test(text.split(/^## Resolutions$/m)[1] ?? ''), 'the Resolutions hint does not allow saying none');
  assert.ok(!/Generated with|claude\.ai|Requested by|attribution|https?:\/\/|^---$/mi.test(text), 'the template carries attribution, a link or a footer');
}
