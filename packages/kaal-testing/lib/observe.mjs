// Observing Cases: the run report of Testing and the Case catalog become the map { '<id>': GREEN | RED | UNKNOWN } that a hold judge reads,
// with the evidence that says how far to trust it. Pure: it reads no file, runs nothing and decides no verdict (testing/F160, F161).
// A Case is GREEN only when its own file was run, has at least one test, every test is GREEN and no problem names the file.
// Anything Testing cannot show is UNKNOWN, never GREEN. Whether a collector passes is the judge's, not this module's.
const REPORT = 'kaal-testing/run-report@1';
const FORM = 'kaal-testing/case-form@1';
// Form findings that say a Case's identity cannot be trusted; the others (first-line, target-missing) are copied, not acted on.
const IDENTITY = new Set(['case-id', 'id-differs', 'duplicate-id']);

/**
 * observeCases({ report, cases, findings, form, revision, expectedRevision, runId, producedBy }) -> { observed, evidence }.
 * report: a kaal-testing/run-report@1. cases, findings: collectCases(root). form: an optional kaal-testing/case-form@1.
 * revision is the commit the report was produced from; expectedRevision the one the consumer holds; a different one makes everything UNKNOWN.
 */
export function observeCases({ report, cases, findings = [], form, revision, expectedRevision, runId, producedBy }) {
  const duplicates = findings.filter((f) => f.kind === 'duplicate-id');
  const unreadable = findings.filter((f) => f.kind === 'no-id').flatMap((f) => f.files);
  const evidence = {
    revision, expectedRevision, runId, producedBy,
    reasons: {}, uncataloged: [],
    catalog: { complete: findings.length === 0, findings, unobservable: unreadable, form: { checked: false, findings: [] } },
  };

  if (form !== undefined) {
    if (form?.schema === FORM) {
      const found = form.findings ?? [];
      evidence.catalog.form = { checked: true, findings: found };
      if (found.some((f) => IDENTITY.has(f.kind))) evidence.catalog.complete = false;
    } else evidence.catalog.complete = false; // a form report we cannot read says nothing about the form of the Cases
  }

  // A duplicated id stays in the map: a Case under it can never be read as GREEN.
  const withDuplicates = (observed) => {
    for (const d of duplicates) { observed[d.id] = 'UNKNOWN'; evidence.reasons[d.id] = d.detail; }
    return { observed, evidence };
  };
  const nothing = (why) => {
    const observed = {};
    for (const c of cases) { observed[c.id] = 'UNKNOWN'; evidence.reasons[c.id] = why; }
    evidence.reason = why;
    return withDuplicates(observed);
  };

  if (report?.schema !== REPORT) return nothing('no valid run report');
  if (!revision || !expectedRevision || !runId) return nothing('the report has no revision or run id');
  if (revision !== expectedRevision) return nothing(`the report is of revision ${revision}, not ${expectedRevision}`);
  const { complete, files: ran, problems } = report.execution;
  if (!complete && problems.length === 0) return nothing('the run was incomplete and no problem says where');

  const testsOf = new Map();
  for (const t of report.tests) testsOf.set(t.file, [...(testsOf.get(t.file) ?? []), t]);
  const cataloged = new Set(cases.map((c) => c.file));
  // A test is attributed to a Case by its file's catalog entry, never by the report's own name-derived `case` field.
  evidence.uncataloged = report.tests.filter((t) => !cataloged.has(t.file)).map((t) => ({ file: t.file, name: t.name }));

  const observed = {};
  for (const c of cases) {
    const tests = testsOf.get(c.file) ?? [];
    let why;
    let state = 'UNKNOWN';
    if (!ran.includes(c.file)) why = 'the file was not run';
    else if (tests.some((t) => t.actual === 'RED')) { state = 'RED'; why = 'a test is RED'; }
    else if (tests.length === 0) why = 'the file has no test';
    else if (problems.some((p) => p.file === c.file)) why = 'the file had an execution problem';
    else if (tests.some((t) => t.actual !== 'GREEN')) why = 'a test is not GREEN';
    else state = 'GREEN';
    observed[c.id] = state;
    if (why) evidence.reasons[c.id] = why;
  }
  return withDuplicates(observed);
}
