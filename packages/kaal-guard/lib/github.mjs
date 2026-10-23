// Reporting to GitHub Actions, beside the runner: an annotation for each verdict that is not a pass,
// and a table in the step summary. It takes the runner's results and knows nothing of how a check
// decides. Beside it, verify: a static reading of the workflow files, which shows that a job names
// every ci check. It never proves that GitHub ran a job, nor that branch protection requires it.
import { appendFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

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

const cell = (s) => s.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");

/** Appends the run's verdicts, each by its own name, to the step summary file, if there is one. */
export function summarize(results, file) {
  if (!file) return;
  const rows = results.map((r) => `| ${cell(r.name)} | ${r.verdict} | ${cell(r.evidence)} |`);
  appendFileSync(file, ["### kaal-guard", "", "| Check | Verdict | Evidence |", "| --- | --- | --- |", ...rows, ""].join("\n") + "\n");
}

/** Each job's text in a workflow, from its key under jobs: to the next job's key. */
function jobs(text) {
  const start = text.search(/^jobs:\s*$/m);
  if (start < 0) return [];
  const body = text.slice(start).split(/\r?\n/).slice(1);
  const found = [];
  for (const line of body) {
    if (/^\S/.test(line)) break;
    if (/^  [^\s#][^:]*:\s*(#.*)?$/.test(line)) found.push([]);
    if (found.length && !/^\s*#/.test(line)) found[found.length - 1].push(line);
  }
  return found.map((lines) => lines.join("\n"));
}

/** The checks one job names: `kaal-guard run --check <name>`, or `--check ${{ matrix.<key> }}` with its matrix's values. */
function named(job) {
  const names = new Set();
  for (const [, word] of job.matchAll(/kaal-guard run(?:\s+\S+)*?\s+--check\s+("[^"]*"|'[^']*'|\$\{\{[^}]*\}\}|\S+)/g)) {
    const key = /^\$\{\{\s*matrix\.([A-Za-z0-9_-]+)\s*\}\}$/.exec(word)?.[1];
    if (key) for (const [, value] of job.matchAll(new RegExp(`(?:^|[\\s{,-])${key}:\\s*("[^"]*"|'[^']*'|[^\\s,}]+)`, "gm"))) names.add(value.replace(/^["']|["']$/g, ""));
    else names.add(word.replace(/^["']|["']$/g, ""));
  }
  return names;
}

/**
 * Whether the workflow files under .github/workflows name a job for every ci check in the list.
 * Returns { results }, one per ci check, read from the files alone.
 */
export function verify(root, list) {
  const dir = join(root, ".github", "workflows");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort() : [];
  const covered = new Map();
  for (const file of files) {
    for (const job of jobs(readFileSync(join(dir, file), "utf8"))) for (const name of named(job)) if (!covered.has(name)) covered.set(name, file);
  }
  const ci = Object.keys(list.checks).filter((name) => list.checks[name].runs.includes("ci"));
  return {
    results: ci.map((name) =>
      covered.has(name)
        ? { name, verdict: "pass", evidence: `a job in .github/workflows/${covered.get(name)} runs it (static; not proof that it ran or is required)` }
        : { name, verdict: "fail", evidence: "no workflow job runs it", do: `add a step running kaal-guard run --check ${name} --github to a job, and make that job required` }),
  };
}
