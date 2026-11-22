// Case testing/T386 tests: testing/F160. A Case is GREEN only when it ran completely and every test of its file is GREEN.
import assert from 'node:assert/strict';
import { REV as REVISION, caseText, load, report, tree } from './lib.mjs';

export const id = 'testing/T386';
export const tests = ['testing/F160'];
export const title = 'observeCases is GREEN only for a Case that ran, with every test GREEN and its file clean; RED for a RED test; UNKNOWN with a reason otherwise';

export async function run() {
  const { collectCases } = await load('cases');
  const { observeCases } = await load('observe');
  const root = tree(Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((n) => [`p/T${n}.test.mjs`, caseText(`cap/T${n}`)])));
  const { cases } = await collectCases(root);
  const f = (n) => `p/T${n}.test.mjs`;
  const r = report({
    tests: [
      { file: f(1), actual: 'GREEN' }, { file: f(1), actual: 'GREEN' },
      { file: f(2), actual: 'GREEN' }, { file: f(2), actual: 'RED' },
      { file: f(3), actual: 'GREEN' }, { file: f(3), actual: 'UNKNOWN', reason: 'skipped' },
      { file: f(4), actual: 'GREEN' },
      { file: f(5), actual: 'UNKNOWN', reason: 'error' },
      // T6 was not run at all; T7 has no test; T8 is run but its title says another Case
      { file: f(8), actual: 'GREEN', case: 'cap/T1' },
      { file: 'elsewhere/x.test.mjs', actual: 'GREEN' },
    ],
    files: [f(1), f(2), f(3), f(4), f(5), f(7), f(8), 'elsewhere/x.test.mjs'],
    problems: [{ file: f(4), kind: 'cancelled' }, { file: f(7), kind: 'empty-inventory' }],
  });
  const result = observeCases({ report: r, cases, revision: REVISION, expectedRevision: REVISION, runId: '1', producedBy: 'pull-request' });
  const o = result.observed;
  assert.equal(o['cap/T1'], 'GREEN', 'all tests GREEN, file clean');
  assert.equal(o['cap/T2'], 'RED', 'any RED test makes the Case RED');
  assert.equal(o['cap/T3'], 'UNKNOWN', 'a skipped test is not GREEN');
  assert.equal(o['cap/T4'], 'UNKNOWN', 'a problem of the file is not GREEN, though its tests are');
  assert.equal(o['cap/T5'], 'UNKNOWN', 'an error is UNKNOWN, never RED');
  assert.equal(o['cap/T6'], 'UNKNOWN', 'a Case whose file was not run is UNKNOWN');
  assert.equal(o['cap/T7'], 'UNKNOWN', 'a Case whose file has no test is UNKNOWN');
  assert.equal(o['cap/T8'], 'GREEN', 'attribution is by the catalog file, whatever the test says about its Case');
  assert.deepEqual(Object.keys(o).sort(), cases.map((c) => c.id).sort(), 'every Case of the catalog is observed, and nothing else');
  for (const c of cases) if (o[c.id] !== 'GREEN') assert.ok(result.evidence.reasons[c.id], `${c.id} says why it is not GREEN`);
  assert.deepEqual(result.evidence.uncataloged.map((t) => t.file), ['elsewhere/x.test.mjs'], 'a test in a file the catalog does not list is reported and decides nothing');
  assert.equal(observeCases({ report: { schema: 'other' }, cases, revision: REVISION, expectedRevision: REVISION, runId: '1', producedBy: 'pull-request' }).observed['cap/T1'], 'UNKNOWN', 'a report that is not run-report@1 gives UNKNOWN');
  assert.equal(observeCases({ report: report({ tests: [{ file: f(1), actual: 'GREEN' }], files: [f(1)], complete: false }), cases, revision: REVISION, expectedRevision: REVISION, runId: '1', producedBy: 'pull-request' }).observed['cap/T1'], 'UNKNOWN', 'an incomplete run is never GREEN');
}

