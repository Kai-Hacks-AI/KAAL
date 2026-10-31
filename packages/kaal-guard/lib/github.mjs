// Reporting to GitHub Actions, beside the runner: an annotation for each verdict that is not a pass,
// and a table in the step summary. It takes the runner's results and knows nothing of how a check
// decides. Beside it, verify: a static reading of the workflow files, which shows that a job names
// every ci check. It never proves that GitHub ran a job, nor that branch protection requires it.
import { appendFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { Refusal } from "./config.mjs";

const escapeData = (s) => s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const escapeProperty = (s) => escapeData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");

/**
 * The workflow command for one result, if it needs one: fail and cannot judge are errors, held a warning,
 * not applicable a notice. An error names the Skill's path when one is given (F21).
 */
function annotation(r, skill) {
  const kind = { fail: "error", "cannot judge": "error", held: "warning", "not applicable": "notice" }[r.verdict];
  if (!kind) return undefined;
  const message = (r.do ? `${r.evidence} (do: ${r.do})` : r.evidence) + (kind === "error" && skill ? `; to resolve it, read the kaal-guard Skill at ${skill}` : "");
  return `::${kind} title=${escapeProperty(`${r.verdict}: ${r.name}`)}::${escapeData(message)}`;
}

/** The annotation lines for a run, its errors naming the Skill's path when one is given. */
export function annotations(results, skill) {
  return results.map((r) => annotation(r, skill)).filter(Boolean);
}

const cell = (s) => s.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");

/** Appends the run's verdicts, each by its own name, to the step summary file, if there is one, and the reminder line when one is given (F21). */
export function summarize(results, file, reminder) {
  if (!file) return;
  const rows = results.map((r) => `| ${cell(r.name)} | ${r.verdict} | ${cell(r.evidence)} |`);
  appendFileSync(file, ["### kaal-guard", "", "| Check | Verdict | Evidence |", "| --- | --- | --- |", ...rows, "", ...(reminder ? [reminder, ""] : [])].join("\n") + "\n");
}

/**
 * Guard's declared form, the only thing verify reads (run.md#verify). In a workflow, the jobs are the
 * `  <key>:` lines indented two spaces directly under a top-level `jobs:` line. A job declares a check
 * with a step whose whole `run:` value, on that one line, is `kaal-guard run`, `npx kaal-guard run` or
 * `npx --no kaal-guard run` with `--check <name>`. `--check ${{ matrix.check }}` declares each check
 * the job lists on a line of its own as `- { check: <name>, … }`. `run --ci` declares every ci check:
 * the consumer's one assignment of all of them to that job, as in the workflow init --ci installs (F17).
 * Names are plain words. The invocation is the whole line: each further argument is a word, plain or
 * quoted, with no shell operator and no GitHub expression, so the step's exit status is Guard's. Nothing
 * else declares anything: verify infers nothing from scripts or other YAML, and Guard never fills in a
 * check no job declares.
 */
const ARG = String.raw`(?:[^\s"'\\;&|<>()\`#{}]|"(?:[^"\\\`$]|\$(?!\{))*"|'[^']*')+`;
const INVOCATION = new RegExp(String.raw`^(?:- )?run: (?:npx (?:--no )?)?kaal-guard run(?: ${ARG})*? --check (\$\{\{ matrix\.check \}\}|[^\s"'{}$,#]+)(?: ${ARG})*$`);
const ENTRY = /^- \{ ?check: ([^\s"'{}$,#]+) ?[,}]/;
const EVERY = new RegExp(String.raw`^(?:- )?run: (?:npx (?:--no )?)?kaal-guard run --ci(?: ${ARG})*$`);

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

/** The consistency check's declared form: a step whose whole `run:` value runs kaal-guard verify, optionally with --config <dir>, then --github. */
const VERIFY = /^(?:- )?run: (?:npx (?:--no )?)?kaal-guard verify(?: --config [^\s"'{}$#;&|<>]+)?(?: --github)?$/;

/** The checks one job names in Guard's declared form. */
function named(job) {
  const names = new Set();
  for (const line of job.lines) {
    const name = INVOCATION.exec(line)?.[1];
    if (name === "${{ matrix.check }}") for (const entry of job.lines) ENTRY.test(entry) && names.add(ENTRY.exec(entry)[1]);
    else if (name) names.add(name);
  }
  return names;
}

/**
 * Every declaration in Guard's declared form in .github/workflows, in file and job order: { name, job,
 * file } for a check named, { name: "ci", every: true, job, file } for a job that runs every ci check, and
 * { name: "verify", verify: true, job, file } for the consistency check. The lifecycle reads these to
 * recognize a repository's existing integration (F17); nothing else does.
 */
export function declarations(root) {
  const dir = join(root, ".github", "workflows");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort() : [];
  const found = [];
  for (const file of files) {
    // A workflow entry Guard cannot read, such as a directory or a link to nothing, is cannot judge (F10, F17).
    let kind;
    try {
      const entry = statSync(join(dir, file));
      if (!entry.isFile()) kind = entry.isDirectory() ? "is a directory" : "is not a regular file";
    } catch (error) {
      kind = error.code === "ENOENT" ? "is a link to nothing" : `cannot be opened (${error.code ?? error.message})`;
    }
    if (kind) throw new Refusal(`.github/workflows/${file}: ${kind}, so Guard cannot read it as a workflow`, `remove .github/workflows/${file}, or make it a workflow file`);
    for (const job of jobs(readFileSync(join(dir, file), "utf8"))) {
      const at = { job: job.key, file: `.github/workflows/${file}` };
      for (const name of named(job)) found.push({ name, ...at });
      if (job.lines.some((line) => EVERY.test(line))) found.push({ name: "ci", every: true, ...at });
      if (job.lines.some((line) => VERIFY.test(line))) found.push({ name: "verify", verify: true, ...at });
    }
  }
  return found;
}

/** The step that runs one ci check in a job of the consumer's own workflow, in the declared form. */
export const step = (name, config) => `- run: npx --no kaal-guard run --check ${name}${config ? ` --config ${config}` : ""} --github`;

/** The ci checks in the list that no declaration runs, in declaration order: missing coverage, which Guard reports and never fills. */
export function uncovered(list, found) {
  if (found.some((d) => d.every)) return [];
  const named = new Set(found.filter((d) => !d.verify).map((d) => d.name));
  return Object.keys(list.checks).filter((name) => list.checks[name].runs.includes("ci") && !named.has(name));
}

/**
 * Which ci checks in the list a job in .github/workflows declares in Guard's declared form. This is
 * declared integration only: that GitHub ran the job is CI execution evidence, and that GitHub requires
 * it is repository governance; verify establishes neither. Returns { results }, one per ci check.
 */
export function verify(root, list) {
  const found = declarations(root);
  const where = new Map();
  for (const d of found) if (!d.verify && !d.every && !where.has(d.name)) where.set(d.name, `job ${d.job} in ${d.file}`);
  const every = found.find((d) => d.every);
  const ci = Object.keys(list.checks).filter((name) => list.checks[name].runs.includes("ci"));
  if (every) for (const name of ci) if (!where.has(name)) where.set(name, `job ${every.job} in ${every.file}, which runs every ci check (kaal-guard run --ci)`);
  return {
    results: ci.map((name) =>
      where.has(name)
        ? { name, verdict: "pass", evidence: `declared by ${where.get(name)}; declared integration only, not that GitHub ran or requires that job` }
        : { name, verdict: "fail", evidence: "no workflow job declares it in Guard's declared form; Guard does not run it in CI on its own", do: `give a job of your workflow the step "${step(name)}", or run kaal-guard init --ci to hand every ci check to Guard's workflow; then make that job required` }),
  };
}
