// The file hold Act reads (release/C125), assembled from what Testing wrote (release/C135): `{ observed, evidence }`.
//   node assemble-observation.mjs --observed observed.json --evidence evidence.json --report run-report.json --cases cases.txt [--out observation.json]
// The run report comes from a job that ran candidate code, so it is read as untrusted data before its observation is passed on: a report that does not name exactly the files that
// were asked for, names a test of a file that was not asked for, or repeats a test, makes the catalog incomplete, and hold Act answers UNKNOWN. This cannot show that a verdict
// in a well-formed report is true: a report that is complete, of the right revision and wrongly GREEN is not detected here (release/C135, residual risk).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (path) => JSON.parse(readFileSync(path, 'utf8'));

// Pure. `asked` is the list of files the run was asked to run. Returns the problems found in the report, empty when it is well formed.
export function reportProblems(report, asked) {
  const problems = [];
  if (!report || typeof report !== 'object' || !report.execution || !Array.isArray(report.execution.files) || !Array.isArray(report.tests)) return ['the run report is not the shape Testing writes'];
  const ran = new Set(report.execution.files), want = new Set(asked);
  for (const f of want) if (!ran.has(f)) problems.push(`the report does not name ${f}, which was asked for`);
  for (const f of ran) if (!want.has(f)) problems.push(`the report names ${f}, which was not asked for`);
  const seen = new Set();
  for (const t of report.tests) {
    if (!want.has(t.file)) problems.push(`a test is reported for ${t.file}, which was not asked for`);
    const key = `${t.file}\n${t.name}`;
    if (seen.has(key)) problems.push(`a test is reported twice: ${t.file} ${t.name}`);
    seen.add(key);
  }
  return problems;
}

// Pure. The observation file: Testing's own, or, when the report is not well formed, one that says so and holds nothing.
export function assemble({ observed, evidence, report, asked }) {
  const problems = reportProblems(report, asked);
  if (!problems.length) return { observed, evidence };
  const e = { ...evidence, catalog: { ...evidence.catalog, complete: false, findings: [...(evidence.catalog?.findings ?? []), ...problems.map((detail) => ({ kind: 'report', detail }))] } };
  return { observed: {}, evidence: e };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  try {
    const asked = readFileSync(arg('--cases'), 'utf8').split('\n').filter(Boolean);
    const out = assemble({ observed: read(arg('--observed')), evidence: read(arg('--evidence')), report: read(arg('--report')), asked });
    writeFileSync(arg('--out') ?? 'observation.json', `${JSON.stringify(out, null, 1)}\n`);
  } catch (e) { console.error(String(e.message)); process.exit(2); }
}
