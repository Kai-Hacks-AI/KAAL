// Case controls/T1124 tests: controls/F41
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/care.mjs');
const who = { proposedBy: 'a reviewer', selectedBy: 'the decider', reason: 'because' };
const ok = {
  contain: { finding: 'f1', response: 'contain', owner: 'o', limits: 'read only', ...who },
  accept: { finding: 'f2', response: 'accept', owner: 'o', ...who },
  ratchet: { finding: 'f3', response: 'ratchet', owner: 'o', corrects: 'work-1', ...who },
  eliminate: { finding: 'f4', response: 'eliminate', corrects: 'work-2', ...who },
};
const valid = (finding) => ({ finding, disposition: 'valid', reviewedBy: 'a reviewer' });
const disp = {
  f1: valid('f1'), f2: valid('f2'), f3: valid('f3'), f4: valid('f4'),
  f5: { finding: 'f5', disposition: 'invalid', reviewedBy: 'a reviewer', evidence: 'the check misread the file' },
  f6: { finding: 'f6', disposition: 'unknown', reviewedBy: 'a reviewer', investigate: 'who owns the file' },
};
export const id = 'controls/T1124';
export const tests = ['controls/F41'];
export const title = 'a record is complete when every finding has a Review disposition and only each valid one has exactly one well-formed response, every failure is named, invalid and unknown findings take no response, and nothing is selected or activated';
export async function run() {
  assert.ok(existsSync(lib), 'scripts/care.mjs is absent');
  const { judgeDecision } = await import(pathToFileURL(lib).href);
  const findings = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'];
  const dispositions = Object.values(disp);
  const decisions = Object.values(ok);
  const run1 = (over = {}) => judgeDecision({ findings, dispositions, decisions, ...over });
  const pass = run1();
  assert.equal(pass.verdict, 'PASS', 'a complete record was refused');
  assert.deepEqual(pass.unresolved, ['f6'], 'the unknown finding was not listed as unresolved');
  assert.deepEqual(Object.keys(pass).sort(), ['reasons', 'unresolved', 'verdict'], 'the answer carried more than the verdict, reasons and unresolved (a response, a baseline, an activation)');
  const kinds = (over) => run1(over).reasons.map((r) => r.kind + ':' + r.finding + (r.field ? ':' + r.field : ''));
  const without = (list, f) => list.filter((x) => x.finding !== f);
  // dispositions
  assert.deepEqual(kinds({ dispositions: without(dispositions, 'f5') }), ['undisposed:f5'], 'an unreviewed finding was not named');
  assert.deepEqual(kinds({ dispositions: [...dispositions, disp.f5] }), ['duplicate-disposition:f5'], 'two dispositions for one finding passed');
  assert.deepEqual(kinds({ dispositions: [...without(dispositions, 'f5'), { ...disp.f5, disposition: 'maybe' }] }), ['bad-disposition:f5'], 'an unknown disposition passed');
  assert.deepEqual(kinds({ dispositions: [...without(dispositions, 'f5'), { ...disp.f5, evidence: '' }] }), ['missing-field:f5:evidence'], 'an invalid finding without evidence passed');
  assert.deepEqual(kinds({ dispositions: [...without(dispositions, 'f6'), { ...disp.f6, investigate: undefined }] }), ['missing-field:f6:investigate'], 'an unknown finding without what to investigate passed');
  assert.deepEqual(kinds({ dispositions: [...without(dispositions, 'f1'), { ...disp.f1, reviewedBy: '' }] }), ['missing-field:f1:reviewedBy'], 'a disposition nobody reviewed passed');
  assert.deepEqual(kinds({ dispositions: [...dispositions, valid('zz')] }), ['unknown-finding:zz'], 'a disposition for a finding that is not listed passed');
  // invalid and unknown never take a response
  assert.deepEqual(kinds({ decisions: [...decisions, { ...ok.accept, finding: 'f5' }] }), ['decision-not-valid:f5'], 'an invalid finding was accepted');
  assert.deepEqual(kinds({ decisions: [...decisions, { ...ok.contain, finding: 'f6' }] }), ['decision-not-valid:f6'], 'an unknown finding was assigned a response');
  assert.deepEqual(kinds({ dispositions: [...without(dispositions, 'f2'), { ...disp.f5, finding: 'f2' }] }), ['decision-not-valid:f2'], 'a decision for a finding reviewed invalid passed');
  // valid findings take exactly one well-formed response
  assert.deepEqual(kinds({ decisions: without(decisions, 'f1') }), ['uncovered:f1'], 'a valid finding without a response was not named');
  assert.deepEqual(kinds({ decisions: [...decisions, { ...ok.accept }] }), ['duplicate-decision:f2'], 'two responses for one finding passed');
  assert.deepEqual(kinds({ decisions: [...decisions, { ...ok.accept, finding: 'zz' }] }), ['unknown-finding:zz'], 'a response for a finding that is not listed passed');
  assert.deepEqual(kinds({ decisions: [{ ...ok.contain, response: 'ignore' }, ...decisions.slice(1)] }), ['bad-response:f1'], 'an unknown response passed');
  assert.deepEqual(kinds({ decisions: [{ finding: 'f2', response: 'accept', ...who }, ...without(decisions, 'f2')] }), ['missing-field:f2:owner'], 'an accept without an owner passed');
  assert.deepEqual(kinds({ decisions: [{ ...ok.contain, limits: '' }, ...decisions.slice(1)] }), ['missing-field:f1:limits'], 'a contain without what limits it passed');
  assert.deepEqual(kinds({ decisions: [{ finding: 'f3', response: 'ratchet', corrects: 'work-1', ...who }, ...without(decisions, 'f3')] }), ['missing-field:f3:owner'], 'a ratchet without a named owner passed');
  assert.deepEqual(kinds({ decisions: [{ finding: 'f3', response: 'ratchet', owner: 'o', ...who }, ...without(decisions, 'f3')] }), ['missing-field:f3:corrects'], 'a ratchet without the corrective work stood for acceptance');
  assert.deepEqual(kinds({ decisions: [{ ...ok.eliminate, selectedBy: '' }, ...decisions.slice(0, 3)] }), ['missing-field:f4:selectedBy'], 'a response nobody selected passed');
  assert.deepEqual(kinds({ decisions: [{ ...ok.eliminate, proposedBy: undefined }, ...decisions.slice(0, 3)] }), ['missing-field:f4:proposedBy'], 'a response nobody proposed passed');
  assert.deepEqual(judgeDecision({ findings: [], dispositions: [], decisions: [] }), { verdict: 'PASS', reasons: [], unresolved: [] }, 'a clean scan needs nothing and was refused');
  for (const bad of [{ dispositions, decisions }, { findings, decisions }, { findings, dispositions }, { findings, dispositions, decisions: 'x' }, { findings: [1], dispositions: [], decisions: [] }]) assert.equal(judgeDecision(bad).verdict, 'UNKNOWN', 'a missing or malformed input was not UNKNOWN');
}
