// Case release/T1372 tests: release/C127
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM } from './evidence-fixtures.mjs';
export const id = 'release/T1372';
export const tests = ['release/C127'];
export const title = 'the workflow source hands the pull request, the merge result and the run to the four judges and nothing else: no credential, no flag set, no ledger written by the workflow';
export async function run() {
  const text = readFileSync(join(RM, '05-src/wiring/workflows/controls-act.yml'), 'utf8');
  const code = text.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  assert.equal((code.match(/KAAL_PR: \$\{\{ github\.event\.pull_request\.number \}\}/g) ?? []).length, 4);
  assert.equal((code.match(/KAAL_MERGE_SHA: \$\{\{ github\.sha \}\}/g) ?? []).length, 4);
  assert.equal((code.match(/KAAL_RUN_ID: \$\{\{ github\.run_id \}\}/g) ?? []).length, 4);
  assert.doesNotMatch(code, /evidence\.jsonl|git (add|commit|push)|contents: write|secrets\.|GITHUB_TOKEN|github\.token/);
}
