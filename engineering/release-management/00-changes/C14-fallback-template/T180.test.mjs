// Case release/T180 tests: G47
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T180';
export const tests = ['release/G47'];
export const title = 'gap release/G47 is closed: A41 and its fallback template are present';
export function run() {
  read(join(cap, '03-architecture/A41-fallback-template/A41.md'), 'A41');
  const text = read(join(cap, '03-architecture/A41-fallback-template/fallback-template.md'), 'the fallback template');
  assert.deepEqual(headings(text), ['Change', 'Because']);
}
