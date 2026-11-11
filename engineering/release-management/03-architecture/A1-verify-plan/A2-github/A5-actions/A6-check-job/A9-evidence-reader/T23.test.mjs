// Case release/T23 tests: release/A9
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../../../../../05-src/plan/judge.mjs';
import { readEvidence } from '../../../../../../05-src/plan/evidence.mjs';
export const id = 'release/T23';
export const tests = ['release/A9'];
export const title = 'the evidence reader reports a meaningful observed RED from current evidence, rejects an unconditional failure as proof, and reports missing evidence as UNKNOWN';
const plan = {
  intents: [{ id: 'release/I1' }],
  cases: [{ id: 'release/T1', found: 'release/I1', tests: ['release/I1'] }],
};
const row = (over) => ({ case: 'release/T1', target: 'release/I1', result: 'failed', reason: 'assertion', ...over });
test(`${id} ${title}`, async () => {
  const red = await judge({ ...plan, evidence: readEvidence(JSON.stringify([row({})])) });
  assert.equal(red.verdict, 'PASS');

  const unconditional = await judge({ ...plan, evidence: readEvidence(JSON.stringify([row({ reason: 'unconditional' })])) });
  assert.equal(unconditional.verdict, 'FAIL');
  assert.ok(unconditional.findings.some((f) => f.rule === 'F1/6'));

  for (const missing of [undefined, '', 'not json', '{}', '[1]']) {
    const result = await judge({ ...plan, evidence: readEvidence(missing) });
    assert.equal(result.verdict, 'UNKNOWN', `evidence ${JSON.stringify(missing)}`);
    assert.ok(result.findings.some((f) => f.rule === 'F1/6' && f.status === 'unknown'));
  }
});
