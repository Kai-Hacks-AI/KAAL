// Case release/T109 tests: release/A26
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const adapter = join(repo, 'engineering/release-management/05-src/vulnerability-analysis/analyze.mjs');
export const id = 'release/T109';
export const tests = ['release/A26'];
export const title = 'the command Guard runs ends with 0 for PASS, 1 for FAIL and 2 for UNKNOWN, and prints the record';
export function run() {
  assert.ok(existsSync(adapter), 'the adapter is absent');
  const go = (conclusion, changes) => {
    const env = { PATH: process.env.PATH };
    if (conclusion !== undefined) env.KAAL_ANALYZE_CONCLUSION = conclusion;
    if (changes !== undefined) env.KAAL_ANALYZE_VULNERABLE_CHANGES = changes;
    return spawnSync(process.execPath, [adapter], { env, encoding: 'utf8' });
  };
  const vulnerable = JSON.stringify([{ name: 'left-pad', version: '1.0.0', vulnerabilities: [{ advisory_ghsa_id: 'GHSA-xxxx-xxxx-xxxx', severity: 'high' }] }]);
  const pass = go('success', '[]');
  assert.equal(pass.status, 0);
  assert.equal(JSON.parse(pass.stdout.split('\n')[0]).outcome, 'PASS');
  const fail = go('failure', vulnerable);
  assert.equal(fail.status, 1);
  assert.equal(JSON.parse(fail.stdout.split('\n')[0]).outcome, 'FAIL');
  assert.match(fail.stdout, /GHSA-xxxx-xxxx-xxxx/);
  for (const unknown of [go('failure'), go('success'), go(undefined, undefined), go('success', 'not json')]) {
    assert.equal(unknown.status, 2, 'UNKNOWN must not end with 0');
    assert.equal(JSON.parse(unknown.stdout.split('\n')[0]).outcome, 'UNKNOWN');
  }
}
