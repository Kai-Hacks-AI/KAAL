// Case testing/T387 tests: testing/F161. No report, no revision or another revision: every Case is UNKNOWN, and the evidence is labelled.
import assert from 'node:assert/strict';
import { OTHER, REV, caseText, load, report, tree } from './lib.mjs';

export const id = 'testing/T387';
export const tests = ['testing/F161'];
export const title = 'observeCases gives UNKNOWN for no report, no revision or a report of another revision, and the evidence names revision, run id and who produced it';

export async function run() {
  const { collectCases } = await load('cases');
  const { observeCases } = await load('observe');
  const { cases } = await collectCases(tree({ 'p/T1.test.mjs': caseText('cap/T1'), 'p/T2.test.mjs': caseText('cap/T2') }));
  const good = report({ tests: [{ file: 'p/T1.test.mjs', actual: 'GREEN' }, { file: 'p/T2.test.mjs', actual: 'GREEN' }] });
  const ask = (extra) => observeCases({ report: good, cases, revision: REV, expectedRevision: REV, runId: '42', producedBy: 'pull-request', ...extra });

  const ok = ask({});
  assert.deepEqual(ok.observed, { 'cap/T1': 'GREEN', 'cap/T2': 'GREEN' });
  assert.equal(ok.evidence.revision, REV, 'the evidence carries the revision of the report');
  assert.equal(ok.evidence.expectedRevision, REV, 'and the revision it was asked about');
  assert.equal(ok.evidence.runId, '42', 'and the run id, the recorder');
  assert.equal(ok.evidence.producedBy, 'pull-request', 'and who produced the run');

  for (const [what, extra] of [['no report', { report: undefined }], ['no revision', { revision: undefined }], ['another revision', { revision: OTHER }], ['no revision asked about', { expectedRevision: undefined }], ['no run id', { runId: undefined }]]) {
    const r = ask(extra);
    assert.deepEqual(Object.values(r.observed), ['UNKNOWN', 'UNKNOWN'], `${what}: every Case is UNKNOWN`);
    assert.match(r.evidence.reason ?? '', /report|revision|run/i, `${what}: the evidence says which`);
  }
}
