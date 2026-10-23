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

/**
 * Guard's declared form, the only thing verify reads (run.md#verify). In a workflow, the jobs are the
 * `  <key>:` lines indented two spaces directly under a top-level `jobs:` line. A job declares a check
 * with a step whose whole `run:` value, on that one line, is `kaal-guard run`, `npx kaal-guard run` or
 * `npx --no kaal-guard run` with `--check <name>`. `--check ${{ matrix.check }}` declares each check
 * the job lists on a line of its own as `- { check: <name>, … }`. Names are plain words. Nothing else
 * declares anything: verify infers nothing from scripts or other YAML.
 */
const INVOCATION = /^(?:- )?run: (?:npx (?:--no )?)?kaal-guard run(?: \S+)*? --check (\$\{\{ matrix\.check \}\}|[^\s"'{}$,#]+)(?: |$)/;
const ENTRY = /^- \{ ?check: ([^\s"'{}$,#]+) ?[,}]/;

/** Each job under `jobs:`, as its key and its trimmed lines, without blank or comment lines. */
function jobs(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.indexOf("jobs:");
  const found = [];
  for (const line of start < 0 ? [] : lines.slice(start + 1)) {
    if (/^\S/.test(line)) break;
    const key = /^  ([A-Za-z_][A-Za-z0-9_-]*):$/.exec(line.trimEnd())?.[1];
    if (key) found.push({ key, lines: [] });
    else if (found.length && line.trim() && !line.trim().startsWith("#")) found[found.length - 1].lines.push(line.trim());
  }
  return found;
}

/** The checks one job declares in Guard's declared form. */
function declared(job) {
  const names = new Set();
  for (const line of job.lines) {
    const name = INVOCATION.exec(line)?.[1];
    if (name === "${{ matrix.check }}") for (const entry of job.lines) ENTRY.test(entry) && names.add(ENTRY.exec(entry)[1]);
    else if (name) names.add(name);
  }
  return names;
}

/**
 * Which ci checks in the list a job in .github/workflows declares in Guard's declared form. This is
 * declared integration only: that GitHub ran the job is CI execution evidence, and that GitHub requires
 * it is repository governance; verify establishes neither. Returns { results }, one per ci check.
 */
export function verify(root, list) {
  const dir = join(root, ".github", "workflows");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort() : [];
  const where = new Map();
  for (const file of files) {
    for (const job of jobs(readFileSync(join(dir, file), "utf8"))) {
      for (const name of declared(job)) if (!where.has(name)) where.set(name, `job ${job.key} in .github/workflows/${file}`);
    }
  }
  const ci = Object.keys(list.checks).filter((name) => list.checks[name].runs.includes("ci"));
  return {
    results: ci.map((name) =>
      where.has(name)
        ? { name, verdict: "pass", evidence: `declared by ${where.get(name)}; declared integration only, not that GitHub ran or requires that job` }
        : { name, verdict: "fail", evidence: "no workflow job declares it in Guard's declared form", do: `give a job the step "- run: npx --no kaal-guard run --check ${name} --github", and make that job required` }),
  };
}
