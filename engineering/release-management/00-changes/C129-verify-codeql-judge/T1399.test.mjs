// Case release/T1399 tests: release/C129
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FINDINGS, RUNNER } from './fixtures.mjs';
const text = (u) => readFileSync(new URL(u), 'utf8');
export const id = 'release/T1399';
export const tests = ['release/C129'];
export const title = 'the pure layer imports nothing, and the command never prints a verdict or reads the head of the pull request';
export async function run() {
  assert.doesNotMatch(text(FINDINGS), /^\s*import\s|\brequire\(|\bprocess\.|\bfetch\(/m);
  const runner = text(RUNNER);
  assert.doesNotMatch(runner, /['"`](PASS|FAIL)\b/);
  assert.doesNotMatch(runner, /head\.sha|pull_request\.head|GITHUB_EVENT_PATH|GITHUB_HEAD_REF/);
  assert.equal((runner.match(/\b(writeFileSync|appendFileSync|writeFile|appendFile)\(/g) ?? []).length, 1);
}
