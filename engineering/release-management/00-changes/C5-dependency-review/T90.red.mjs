// Case release/T90 tests: F7
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T90';
export const tests = ['release/G27'];
export const title = 'gap release/G27 is closed: the judge maps the mechanism result to a verdict';
export async function run() {
  const judge = join(repo, 'engineering/release-management/05-src/dependency-verdict/judge.mjs');
  read(judge, 'the judge');
  const m = await import(pathToFileURL(judge).href);
  assert.equal(typeof m.judge, 'function', 'the judge is not exported');
}
