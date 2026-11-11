// Case release/T89 tests: F7
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const judgeFile = join(repo, 'engineering/release-management/05-src/dependency-verdict/judge.mjs');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const judgeModule = () => { assert.ok(existsSync(judgeFile), 'the judge is absent'); return import(pathToFileURL(judgeFile).href); };
export const id = 'release/T89';
export const tests = ['release/F7'];
export const title = 'a successful comparison with no vulnerable change is PASS';
export async function run() {
  const m = await judgeModule();
  
  const v = m.judge({ conclusion: 'success', outputs: { vulnerableChanges: '[]' } });
  assert.equal(v.verdict, 'PASS');
  assert.equal(v.passes, true);
  assert.equal(m.judge({ conclusion: 'success', outputs: { vulnerableChanges: '[]' } }).verdict, v.verdict, 'the same input gives the same verdict');
}
