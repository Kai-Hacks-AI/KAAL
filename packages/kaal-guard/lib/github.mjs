// Reporting to GitHub Actions, beside the runner: an annotation for each verdict that is not a pass,
// and a table in the step summary. It takes the runner's results and knows nothing of how a check
// decides.
import { appendFileSync } from "node:fs";

const escapeData = (s) => s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const escapeProperty = (s) => escapeData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");

/** The workflow command for one result, if it needs one: fail and cannot judge are errors, held a warning, not applicable a notice. */
function annotation(r) {
  const kind = { fail: "error", "cannot judge": "error", held: "warning", "not applicable": "notice" }[r.verdict];
  if (!kind) return undefined;
  const message = r.do ? `${r.evidence} (do: ${r.do})` : r.evidence;
  return `::${kind} title=${escapeProperty(`${r.verdict}: ${r.name}`)}::${escapeData(message)}`;
}

/** The annotation lines for a run. */
export function annotations(results) {
  return results.map(annotation).filter(Boolean);
}

const cell = (s) => s.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");

/** Appends the run's verdicts, each by its own name, to the step summary file, if there is one. */
export function summarize(results, file) {
  if (!file) return;
  const rows = results.map((r) => `| ${cell(r.name)} | ${r.verdict} | ${cell(r.evidence)} |`);
  appendFileSync(file, ["### kaal-guard", "", "| Check | Verdict | Evidence |", "| --- | --- | --- |", ...rows, ""].join("\n") + "\n");
}
