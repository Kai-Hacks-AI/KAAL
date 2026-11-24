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
  ratchet: { finding: 'f3', response: 'ratchet', corrects: 'work-1', ...who },
  eliminate: { finding: 'f4', response: 'eliminate', corrects: 'work-2', ...who },
};
export const id = 'controls/T1124';
export const tests = ['controls/F41'];
export const title = 'a record is complete when every finding has exactly one well-formed decision, each failure is named, and it selects and activates nothing';
export async function run() {
  assert.ok(existsSync(lib), 'scripts/care.mjs is absent');
  const { judgeDecision } = await import(pathToFileURL(lib).href);
  const findings = ['f1', 'f2', 'f3', 'f4'];
  const all = Object.values(ok);
  const pass = judgeDecision({ findings, decisions: all });
  assert.equal(pass.verdict, 'PASS', 'a complete record was refused');
  assert.deepEqual(Object.keys(pass).sort(), ['reasons', 'verdict'], 'the answer carried more than the verdict and reasons (a response, a baseline, an activation)');
  const kinds = (decisions, f = findings) => judgeDecision({ findings: f, decisions }).reasons.map((r) => r.kind + ':' + r.finding + (r.field ? ':' + r.field : ''));
  assert.deepEqual(kinds(all.slice(1)), ['uncovered:f1'], 'an undecided finding was not named');
  assert.deepEqual(kinds([...all, { ...ok.accept, finding: 'zz' }]), ['unknown-finding:zz'], 'a decision for a finding that is not listed passed');
  assert.deepEqual(kinds([...all, ok.accept]), ['duplicate-decision:f2'], 'two decisions for one finding passed');
  assert.deepEqual(kinds([{ ...ok.contain, response: 'ignore' }, ...all.slice(1)]), ['bad-response:f1'], 'an unknown response passed');
  assert.deepEqual(kinds([{ finding: 'f2', response: 'accept', ...who }, ...all.filter((d) => d.finding !== 'f2')]), ['missing-field:f2:owner'], 'an accept without an owner passed');
  assert.deepEqual(kinds([{ ...ok.contain, limits: '' }, ...all.slice(1)]), ['missing-field:f1:limits'], 'a contain without what limits it passed');
  assert.deepEqual(kinds([{ finding: 'f3', response: 'ratchet', ...who }, ...all.filter((d) => d.finding !== 'f3')]), ['missing-field:f3:corrects'], 'a ratchet without the corrective work stood for acceptance');
  assert.deepEqual(kinds([{ ...ok.eliminate, selectedBy: '' }, ...all.slice(0, 3)]), ['missing-field:f4:selectedBy'], 'a decision nobody selected passed');
  assert.deepEqual(kinds([{ ...ok.eliminate, proposedBy: undefined }, ...all.slice(0, 3)]), ['missing-field:f4:proposedBy'], 'a decision nobody proposed passed');
  assert.deepEqual(judgeDecision({ findings: [], decisions: [] }), { verdict: 'PASS', reasons: [] }, 'a clean scan needs no decision and was refused');
  for (const bad of [{ decisions: all }, { findings }, { findings, decisions: 'x' }, { findings: [1], decisions: [] }]) assert.equal(judgeDecision(bad).verdict, 'UNKNOWN', 'a missing or malformed input was not UNKNOWN');
}
