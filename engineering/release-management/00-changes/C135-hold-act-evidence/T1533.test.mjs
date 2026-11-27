// Case release/T1533 tests: release/C135
import assert from 'node:assert/strict';
import { assemble, reportProblems } from '../../05-src/phase/assemble-observation.mjs';
import { judgeHoldWithEvidence } from '../../05-src/phase/judge-act.mjs';
export const id = 'release/T1533';
export const tests = ['release/C135'];
export const title = 'a run report that omits a requested file, names one that was not requested, repeats a test or is not the shape Testing writes makes hold Act answer UNKNOWN, and a well-formed report passes Testing\'s observation on unchanged';
export async function run() {
  const A = 'engineering/x/00-changes/C2/T2.test.mjs', B = 'engineering/x/00-changes/C2/T3.test.mjs';
  const rep = (files, tests) => ({ schema: 'kaal-testing/run-report@1', tests, execution: { complete: true, files, problems: [] } });
  const green = (file) => ({ file, name: 'a', actual: 'GREEN' });
  const evidence = () => ({ revision: 'r', expectedRevision: 'r', catalog: { complete: true, findings: [], unobservable: [] } });
  const observed = { 'x/T2': 'GREEN', 'x/T3': 'GREEN' };
  const judge = (file) => judgeHoldWithEvidence({ changes: [{ id: 'x/C2', applicable: [{ id: 'x/T2', path: 'T2.test.mjs', parked: false }, { id: 'x/T3', path: 'T3.test.mjs', parked: false }] }], retros: [{ reflects: ['x/C2'] }], evidence: file });
  const ok = rep([A, B], [green(A), green(B)]);
  assert.deepEqual(reportProblems(ok, [A, B]), []);
  assert.equal(judge(assemble({ observed, evidence: evidence(), report: ok, asked: [A, B] })).verdict, 'PASS', 'a well-formed report is passed on and the complete observation is PASS');
  const bad = {
    omitted: rep([A], [green(A)]),
    extra: rep([A, B, 'engineering/x/other.test.mjs'], [green(A), green(B)]),
    stray: rep([A, B], [green(A), green(B), green('engineering/x/other.test.mjs')]),
    twice: rep([A, B], [green(A), green(A), green(B)]),
    shapeless: { schema: 'kaal-testing/run-report@1' },
    nothing: null,
  };
  for (const [name, report] of Object.entries(bad)) {
    assert.ok(reportProblems(report, [A, B]).length > 0, `${name}: the report has problems`);
    const answer = judge(assemble({ observed, evidence: evidence(), report, asked: [A, B] }));
    assert.equal(answer.verdict, 'UNKNOWN', `${name}: hold Act answers UNKNOWN, never PASS`);
  }
  // Evidence of another revision stays UNKNOWN whatever the report says (release/C125).
  const other = { ...evidence(), expectedRevision: 's' };
  assert.equal(judge(assemble({ observed, evidence: other, report: ok, asked: [A, B] })).verdict, 'UNKNOWN');
  // A RED Case is a FAIL even in a well-formed report.
  const red = judge(assemble({ observed: { ...observed, 'x/T3': 'RED' }, evidence: evidence(), report: ok, asked: [A, B] }));
  assert.equal(red.verdict, 'FAIL');
}
