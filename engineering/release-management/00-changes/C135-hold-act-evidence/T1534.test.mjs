// Case release/T1534 tests: release/C135
import assert from 'node:assert/strict';
import { assemble } from '../../05-src/phase/assemble-observation.mjs';
import { judgeHoldWithEvidence } from '../../05-src/phase/judge-act.mjs';
export const id = 'release/T1534';
export const tests = ['release/C135'];
export const title = 'the residual risk, kept visible: a well-formed run report of the right revision that says GREEN for a Case that would fail is not detected by files, so hold Act answers PASS, and hold Act stays advisory';
export async function run() {
  // This Case does not pass because the behaviour is good. It records what the design cannot do (release/C135, the CPO's note on the PLAN): the report below is complete, names exactly the
  // requested file, repeats nothing and carries the right revision, and its one verdict is false. Nothing in the files of the assembler or the judge can tell. If a later Change makes this
  // detectable, this Case must change to say so, and the evidence log must be updated with it.
  const F = 'engineering/x/00-changes/C2/T2.test.mjs';
  const forged = { schema: 'kaal-testing/run-report@1', tests: [{ file: F, name: 'it fails', actual: 'GREEN' }], execution: { complete: true, files: [F], problems: [] } };
  const evidence = { revision: 'r', expectedRevision: 'r', catalog: { complete: true, findings: [], unobservable: [] } };
  const answer = judgeHoldWithEvidence({ changes: [{ id: 'x/C2', applicable: [{ id: 'x/T2', path: 'T2.test.mjs', parked: false }] }], retros: [{ reflects: ['x/C2'] }], evidence: assemble({ observed: { 'x/T2': 'GREEN' }, evidence, report: forged, asked: [F] }) });
  assert.equal(answer.verdict, 'PASS', 'a forged GREEN in a well-formed report is not detected');
}
