// Testing's record of what it observed of the Cases of a revision (testing/F175): the pair `observe` gives, plus the facts of the run
// and the findings of an integrity check on the run report. Pure except `observeAt`, which runs the Cases. It decides no verdict.
import { collectCases } from './cases.mjs';
import { observeCases } from './observe.mjs';
import { runCases } from './run.mjs';

export const SCHEMA = 'kaal-testing/observation@1';
const RUN = 'kaal-testing/run-report@1';

/** The report is read as untrusted data: it must be what was asked for. Returns the findings, none when it is. */
function integrityOf(report, requested) {
  if (report?.schema !== RUN) return [{ kind: 'not-a-run-report', detail: `the report is not of schema ${RUN}` }];
  const found = [];
  const want = [...new Set(requested)].sort();
  if (!Array.isArray(report.execution?.files)) found.push({ kind: 'no-file-list', detail: 'the report does not say which files ran' });
  else {
    const files = [...new Set(report.execution.files)];
    for (const f of want) if (!files.includes(f)) found.push({ kind: 'missing-file', detail: `${f} was requested and the report does not name it` });
    for (const f of files) if (!want.includes(f)) found.push({ kind: 'unrequested-file', detail: `${f} is in the report and was not requested` });
  }
  if (!Array.isArray(report.tests)) found.push({ kind: 'no-tests', detail: 'the report has no list of tests' });
  else {
    const seen = new Set();
    for (const t of report.tests) {
      if (!t || typeof t !== 'object' || typeof t.id !== 'string' || typeof t.file !== 'string') { found.push({ kind: 'malformed-test', detail: 'a test of the report has no id or file' }); continue; }
      if (!want.includes(t.file)) found.push({ kind: 'unrequested-test', detail: `${t.id} belongs to ${t.file}, which was not requested` });
      if (seen.has(t.id)) found.push({ kind: 'repeated-test', detail: `${t.id} appears more than once` });
      seen.add(t.id);
    }
  }
  return found;
}

/**
 * assembleObservation({ report, requested, cases, findings, form, revision, expectedRevision, runId, producedBy }) -> kaal-testing/observation@1.
 * report: a run report, possibly produced where candidate code ran. requested: the files the caller asked to be run. cases, findings: collectCases(root).
 */
export function assembleObservation({ report, requested, cases, findings = [], form, revision, expectedRevision, runId, producedBy }) {
  const integrity = integrityOf(report, requested);
  const { observed, evidence } = observeCases({ report: integrity.length > 0 ? undefined : report, cases, findings, form, revision, expectedRevision, runId, producedBy });
  if (integrity.length > 0) evidence.catalog.complete = false;
  const ran = Array.isArray(report?.execution?.files) ? report.execution.files : [];
  const problems = Array.isArray(report?.execution?.problems) ? report.execution.problems : [];
  evidence.execution = { requested: [...new Set(requested)].sort(), ran, complete: integrity.length === 0 && report.execution.complete === true, problems };
  evidence.integrity = integrity;
  return { schema: SCHEMA, observed, evidence };
}

/** Runs the requested files, reads the catalog of `root` and records what was observed. Rejects invalid input (a requested file that is not a file, no file). */
export async function observeAt({ root, files, revision, expectedRevision, runId, producedBy, timeoutMs, form }) {
  const report = await runCases({ files, root, ...(timeoutMs === undefined ? {} : { timeoutMs }) });
  const { cases, findings } = await collectCases(root);
  return assembleObservation({ report, requested: files, cases, findings, form, revision, expectedRevision, runId, producedBy });
}
