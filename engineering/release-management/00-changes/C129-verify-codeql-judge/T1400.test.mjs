// Case release/T1400 tests: release/C129
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { DIR, ANALYSIS_JUDGE, FINDINGS_JUDGE } from './fixtures.mjs';
const text = (u) => readFileSync(new URL(u), 'utf8');
export const id = 'release/T1400';
export const tests = ['release/C129'];
export const title = 'the pure layers import nothing, the commands never print a verdict or read the head of the pull request, and each writes only its findings file';
export async function run() {
  for (const pure of ['lib/analysis.mjs', 'lib/alerts.mjs']) assert.doesNotMatch(text(DIR + pure), /^\s*import\s|\brequire\(|\bprocess\.|\bfetch\(|Date\.now|setTimeout/m, pure);
  const files = [ANALYSIS_JUDGE, FINDINGS_JUDGE, DIR + 'lib/command.mjs', DIR + 'lib/read.mjs'];
  for (const f of files) {
    const t = text(f);
    assert.doesNotMatch(t, /['"`](PASS|FAIL)\b/, `${f} prints a verdict`);
    assert.doesNotMatch(t, /head\.sha|pull_request\.head|GITHUB_EVENT_PATH|GITHUB_HEAD_REF/, `${f} reads the head`);
  }
  assert.equal((files.map(text).join('\n').match(/\b(writeFileSync|appendFileSync|writeFile|appendFile|createWriteStream)\(/g) ?? []).length, 1);
  assert.doesNotMatch(text(ANALYSIS_JUDGE), /readAlerts|alertFindings/);   // the analysis control names no alert
  assert.doesNotMatch(text(FINDINGS_JUDGE), /`(missing|errored):/);                                          // the findings control names no analysis finding
  assert.deepEqual(readdirSync(new URL(DIR)).filter((n) => n.endsWith('.mjs')).sort(), ['judge-codeql-analysis.mjs', 'judge-codeql-findings.mjs']);
}
