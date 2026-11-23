// Case release/T1395 tests: release/C129
import assert from 'node:assert/strict';
import { ANALYSIS, an, EXPECTED, BOTH } from './fixtures.mjs';
export const id = 'release/T1395';
export const tests = ['release/C129'];
export const title = 'the analysis findings name a missing or errored configuration of the sha, and a complete set, an extra configuration or an analysis of another sha changes nothing else';
export async function run() {
  const { analysisFindings } = await import(ANALYSIS);
  const f = (analyses) => analysisFindings({ sha: 'abc', expected: EXPECTED, analyses });
  assert.deepEqual(f(BOTH), []);
  assert.deepEqual(f([BOTH[1]]), ['missing:/language:actions']);
  assert.deepEqual(f([an('/language:actions', { error: 'out of memory' }), BOTH[1]]), ['errored:/language:actions']);
  assert.deepEqual(f([an('/language:actions', { commit_sha: 'other' }), BOTH[1]]), ['missing:/language:actions']);   // an analysis of another sha is no analysis
  assert.deepEqual(f([...BOTH, an('/language:python')]), []);                                               // an extra configuration is not a finding
  assert.deepEqual(f([]), ['missing:/language:actions', 'missing:/language:javascript-typescript']);
  assert.ok(f([an('/language:actions', { error: 'x' }), an('/language:actions'), BOTH[1]]).length === 0, 'one good analysis of the sha is enough');
}
