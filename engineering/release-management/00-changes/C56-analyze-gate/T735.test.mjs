// Case release/T735 tests: release/CTL5
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, job } from './fixtures.mjs';
import { analyze } from '../../05-src/vulnerability-analysis/analyze.mjs';
export const id = 'release/T735';
export const tests = ['release/CTL5'];
export const title = 'a promotion whose dependency changes cannot be analyzed does not proceed: unavailable, incomplete and inconclusive analysis end the Promoting step non-zero, never as a pass, and the control states it';
export async function run() {
  const ok = '[]';
  const cases = [
    ['no result, the mechanism failed', { KAAL_ANALYZE_CONCLUSION: 'failure' }],
    ['no list although the mechanism succeeded', { KAAL_ANALYZE_CONCLUSION: 'success' }],
    ['an empty text as the list', { KAAL_ANALYZE_CONCLUSION: 'success', KAAL_ANALYZE_VULNERABLE_CHANGES: '' }],
    ['a list that cannot be read', { KAAL_ANALYZE_CONCLUSION: 'success', KAAL_ANALYZE_VULNERABLE_CHANGES: '{not json' }],
    ['a result that is not a list', { KAAL_ANALYZE_CONCLUSION: 'success', KAAL_ANALYZE_VULNERABLE_CHANGES: '{"a":1}' }],
    ['an empty list but the mechanism failed', { KAAL_ANALYZE_CONCLUSION: 'failure', KAAL_ANALYZE_VULNERABLE_CHANGES: ok }],
    ['a vulnerable change without an advisory', { KAAL_ANALYZE_CONCLUSION: 'success', KAAL_ANALYZE_VULNERABLE_CHANGES: '[{"name":"x","version":"1","vulnerabilities":[]}]' }],
    ['a conclusion that is neither success nor failure', { KAAL_ANALYZE_CONCLUSION: 'cancelled', KAAL_ANALYZE_VULNERABLE_CHANGES: ok }],
  ];
  for (const [what, env] of cases) {
    const { record, status } = analyze(env);
    assert.notEqual(status, 0, `${what}: the step ends as a pass`);
    assert.equal(record.passes, false, `${what}: the record passes`);
  }
  assert.equal(analyze({ KAAL_ANALYZE_CONCLUSION: 'success', KAAL_ANALYZE_VULNERABLE_CHANGES: ok }).status, 0, 'a clean, complete analysis does not pass');
  const promoting = job('promoting');
  assert.match(promoting, /KAAL_ANALYZE_CONCLUSION: \$\{\{ steps\.review\.conclusion == 'success' && steps\.review\.outcome == 'success' && 'success' \|\| 'failure' \}\}/, 'Promoting does not default the conclusion to failure');
  assert.match(promoting, /run: node engineering\/release-management\/05-src\/vulnerability-analysis\/analyze\.mjs/, 'Promoting does not end in the adapter');
  const file = join(RM, '04-controls/CTL5-gate-analyze-vulnerabilities/CTL5.md');
  assert.ok(existsSync(file), 'CTL5.md is absent');
  const ctl5 = readFileSync(file, 'utf8');
  assert.match(ctl5, /cannot be analyzed/, 'CTL5 does not state that an analysis that cannot be made stops the promotion');
}
