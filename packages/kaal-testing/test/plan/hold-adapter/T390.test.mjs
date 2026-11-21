// Case testing/T390 tests: testing/F163. One identity contract with testing/C69: form findings reach the completeness signal, and a Case of wrong form is never dropped.
import assert from 'node:assert/strict';
import { REV, caseText, load, report, tree } from './lib.mjs';

export const id = 'testing/T390';
export const tests = ['testing/F163'];
export const title = 'identity-affecting form findings make the catalog incomplete, the other kinds are copied, and a Case of wrong form stays in the catalog';

const form = (...kinds) => ({ schema: 'kaal-testing/case-form@1', files: [], targets: { checked: true }, findings: kinds.map((kind) => ({ file: 'p/T1.test.mjs', line: 1, kind, detail: kind })) });

export async function run() {
  const { collectCases, readCase } = await load('cases');
  const { observeCases } = await load('observe');

  assert.deepEqual(readCase(caseText('a/T1', ['a/F1'], '"')).ids, ['a/T1'], 'a double-quoted id is read');
  assert.deepEqual(readCase(caseText('a/T1', ['a/F1'], "'")).ids, ['a/T1'], 'and a single-quoted id');
  assert.deepEqual(readCase(caseText('a/T1', ['a/F1', 'a/F2'], '"')).tests, ['a/F1', 'a/F2'], 'the claims likewise');

  // a Case of wrong form (no first line, an id without a namespace, a target that exists nowhere) is still in the catalog
  const { cases, findings } = await collectCases(tree({ 'p/T1.test.mjs': caseText('T1', ['nowhere/F99']) }));
  assert.deepEqual(cases.map((c) => c.id), ['T1'], 'a Case whose form is wrong stays listed: C69 reports it, the catalog does not drop it');
  assert.deepEqual(findings, [], 'and is no catalog finding');

  const green = report({ tests: [{ file: 'p/T1.test.mjs', actual: 'GREEN' }] });
  const ask = (extra) => observeCases({ report: green, cases, findings, revision: REV, expectedRevision: REV, runId: '1', producedBy: 'pull-request', ...extra });
  assert.equal(ask({}).evidence.catalog.form.checked, false, 'without a form report the form is unchecked');
  assert.equal(ask({}).evidence.catalog.complete, true, 'and that alone does not make the catalog incomplete');
  for (const kind of ['case-id', 'id-differs', 'duplicate-id']) {
    const r = ask({ form: form(kind) });
    assert.equal(r.evidence.catalog.complete, false, `${kind} makes the catalog incomplete, though every Case is GREEN`);
    assert.equal(r.evidence.catalog.form.checked, true);
    assert.deepEqual(r.evidence.catalog.form.findings.map((f) => f.kind), [kind], 'and the finding is copied');
  }
  for (const kind of ['first-line', 'target-missing']) {
    const r = ask({ form: form(kind) });
    assert.equal(r.evidence.catalog.complete, true, `${kind} does not change which Cases exist`);
    assert.deepEqual(r.evidence.catalog.form.findings.map((f) => f.kind), [kind], 'but it is copied');
  }
  assert.equal(ask({ form: { schema: 'other' } }).evidence.catalog.complete, false, 'a form report that is not case-form@1 makes the catalog incomplete');
}
