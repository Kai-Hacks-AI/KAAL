// Case release/T15 tests: release/A1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T15';
export const tests = ['release/A1'];
export const title = 'verify Plan returns PASS, FAIL or UNKNOWN with findings and Recovery, and UNKNOWN never passes';
const valid = {
  intents: [{ id: 'release/I1' }],
  defects: [{ id: 'release/D1' }],
  requirements: [{ id: 'release/F1', kind: 'F', serves: ['release/I1'] }],
  architecture: [{ id: 'release/A1', addresses: ['release/F1', 'release/D1'] }],
  changes: [{ id: 'release/C1', implements: ['release/I1'], resolves: ['release/D1'], closes: ['release/G1'] }],
  gaps: [{ id: 'release/G1' }],
  cases: [
    { id: 'release/T1', found: 'release/I1', tests: ['release/I1'] },
    { id: 'release/T2', found: 'release/F1', tests: ['release/F1'] },
    { id: 'release/T3', found: 'release/A1', tests: ['release/A1'] },
    { id: 'release/T4', found: 'release/D1', tests: ['release/D1'] },
    { id: 'release/T5', found: 'release/C1', tests: ['release/G1'] },
  ],
  evidence: [{ case: 'release/T2', result: 'failed', reason: 'assertion', target: 'release/F1' }],
};
const untraced = {
  changes: [{ id: 'release/C9', implements: [], resolves: [] }],
  requirements: [{ id: 'release/F9', kind: 'F', serves: [] }],
  architecture: [{ id: 'release/A9', addresses: [] }],
  cases: [],
  evidence: [{ case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/F9' }],
};
test(`${id} ${title}`, async () => {
  assert.equal((await judge(valid)).verdict, 'PASS');
  const failed = await judge(untraced);
  assert.equal(failed.verdict, 'FAIL');
  assert.ok(failed.findings.every((f) => f.recovery));
  const unknown = await judge({ unreadable: 'plan.md' });
  assert.equal(unknown.verdict, 'UNKNOWN');
  assert.notEqual(unknown.verdict, 'PASS');
});
