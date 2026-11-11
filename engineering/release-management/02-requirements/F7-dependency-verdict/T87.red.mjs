// Case release/T87 tests: F7
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const judgeFile = join(repo, 'engineering/release-management/05-src/dependency-verdict/judge.mjs');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const judgeModule = () => { assert.ok(existsSync(judgeFile), 'the judge is absent'); return import(pathToFileURL(judgeFile).href); };
export const id = 'release/T87';
export const tests = ['release/F7'];
export const title = 'a vulnerable addition is judged FAIL and names what is vulnerable';
export async function run() {
  const m = await judgeModule();
  
  const result = m.judge({ conclusion: 'failure', outputs: { vulnerableChanges: JSON.stringify([{ name: 'left-pad', version: '1.0.0', manifest: 'package-lock.json', vulnerabilities: [{ advisory_ghsa_id: 'GHSA-xxxx-xxxx-xxxx', severity: 'high' }] }]) } });
  assert.equal(result.verdict, 'FAIL');
  const f = result.findings[0];
  assert.deepEqual([f.package, f.version, f.advisory, f.severity], ['left-pad', '1.0.0', 'GHSA-xxxx-xxxx-xxxx', 'high']);
}
