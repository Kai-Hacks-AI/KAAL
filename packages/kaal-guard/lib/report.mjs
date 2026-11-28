// The report (guard/A24, guard/F48): guard-report.json and the step summary text. The same format locally and in CI.
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const REPORT = "guard-report.json";

export function writeReport(path, report) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`);
}

/** Lines naming the report and each finding's place and next step; also appended to the step summary when GitHub gives one. */
export function describe(path, report, summaryPath = process.env.GITHUB_STEP_SUMMARY) {
  const out = [`${report.result}: ${report.aggregate ?? report.check}: report ${path}`];
  for (const f of report.findings ?? []) {
    out.push(`  ${f.check ?? "-"}${f.member ? ` (${f.member})` : ""}${f.file ? ` in ${f.file}` : ""}: ${f.finding}`);
    out.push(`    do: ${f.fix}`);
  }
  if (summaryPath) { try { appendFileSync(summaryPath, `${out.join("\n")}\n`); } catch { /* the summary is a courtesy */ } }
  return out;
}
