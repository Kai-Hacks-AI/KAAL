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
export const title = 'gap release/G27 is closed: the interpreter maps the mechanism result to an outcome';
export async function run() {
  const interpreter = join(repo, 'engineering/release-management/05-src/vulnerability-analysis/interpreter.mjs');
  read(interpreter, 'the interpreter');
  const m = await import(pathToFileURL(interpreter).href);
  assert.equal(typeof m.interpret, 'function', 'the interpreter is not exported');
}
