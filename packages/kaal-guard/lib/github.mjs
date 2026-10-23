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
 * The reference convention verify reads, and nothing else (run.md). Under a workflow's `jobs:`, a job
 * references a check when one of its steps' `run:` commands, inline or as a line of a `|` or `>` block,
 * begins with `kaal-guard run` (or `npx kaal-guard run`, or `npx --no kaal-guard run`) and gives
 * `--check <name>` as a plain word, or as exactly `${{ matrix.check }}`; then each `check: <name>`
 * entry of that job's `matrix:` is referenced. Any other form references nothing, so verify reports
 * that check as not referenced rather than guess.
 */
const COMMAND = /^(?:npx (?:--no )?)?kaal-guard run(?: \S+)*? --check (\$\{\{ matrix\.check \}\}(?=\s|$)|\S+)/;
const MATRIX = "${{ matrix.check }}";

/** Each job under `jobs:`, as its key and its lines, without blank or comment lines. */
function jobs(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => /^jobs:\s*$/.test(l));
  const found = [];
  for (const line of start < 0 ? [] : lines.slice(start + 1)) {
    if (/^\S/.test(line)) break;
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const key = /^  ([A-Za-z_][A-Za-z0-9_-]*):\s*$/.exec(line)?.[1];
    if (key) found.push({ key, lines: [] });
    else if (found.length) found[found.length - 1].lines.push(line);
  }
  return found;
}

const indent = (line) => line.length - line.trimStart().length;
const plain = (word) => (/^[^\s"'{}$,#]+$/.test(word) ? word : undefined);

/** The check names one job references under the convention. */
function referenced(job) {
  const names = new Set();
  let viaMatrix = false;
  const commands = [];
  job.lines.forEach((line, i) => {
    const run = /^\s*(?:- )?run:\s*(.*)$/.exec(line);
    if (!run) return;
    if (/^[|>][+-]?\s*$/.test(run[1])) {
      const own = indent(line);
      for (const next of job.lines.slice(i + 1)) {
        if (indent(next) <= own) break;
        commands.push(next.trim());
      }
    } else commands.push(run[1].trim());
  });
  for (const command of commands) {
    const word = COMMAND.exec(command)?.[1];
    if (word === MATRIX) viaMatrix = true;
    else if (plain(word)) names.add(word);
  }
  if (viaMatrix) {
    const at = job.lines.findIndex((l) => /^\s*matrix:\s*$/.test(l));
    const own = at < 0 ? 0 : indent(job.lines[at]);
    for (const line of at < 0 ? [] : job.lines.slice(at + 1)) {
      if (indent(line) <= own) break;
      const value = /(?:^\s*(?:- )?\{?\s*|,\s*)check:\s*([^\s,}]+)/.exec(line)?.[1];
      const name = plain(value?.replace(/^"([^"]*)"$|^'([^']*)'$/, "$1$2"));
      if (name) names.add(name);
    }
  }
  return names;
}

/**
 * Which ci checks in the list a job in .github/workflows references under the convention. Static
 * only: a reference is not proof that the job runs, that its step is reached, or that the job is
 * required. Returns { results }, one per ci check.
 */
export function verify(root, list) {
  const dir = join(root, ".github", "workflows");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort() : [];
  const where = new Map();
  for (const file of files) {
    for (const job of jobs(readFileSync(join(dir, file), "utf8"))) {
      for (const name of referenced(job)) if (!where.has(name)) where.set(name, `job ${job.key} in .github/workflows/${file}`);
    }
  }
  const ci = Object.keys(list.checks).filter((name) => list.checks[name].runs.includes("ci"));
  return {
    results: ci.map((name) =>
      where.has(name)
        ? { name, verdict: "pass", evidence: `statically referenced by ${where.get(name)}; whether GitHub runs or requires that job is outside verify` }
        : { name, verdict: "fail", evidence: "no workflow job references it", do: `add a step "run: npx kaal-guard run --check ${name} --github" to a job, and make that job required` }),
  };
}
