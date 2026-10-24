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
 * the job lists on a line of its own as `- { check: <name>, … }`; with the matrix line
 * `check: ${{ fromJSON(needs.<key>.outputs.checks) }}`, where job <key> of the same workflow has a step
 * whose whole `run:` value runs `kaal-guard list --undeclared`, it declares every ci check that no job
 * declares by name. Names are plain words. Nothing else declares anything: verify infers nothing from
 * scripts or other YAML.
 */
const INVOCATION = /^(?:- )?run: (?:npx (?:--no )?)?kaal-guard run(?: \S+)*? --check (\$\{\{ matrix\.check \}\}|[^\s"'{}$,#]+)(?: |$)/;
const ENTRY = /^- \{ ?check: ([^\s"'{}$,#]+) ?[,}]/;
const MATRIX = /^check: \$\{\{ fromJSON\(needs\.([A-Za-z_][A-Za-z0-9_-]*)\.outputs\.checks\) \}\}$/;
const LIST = /^(?:- )?run: (?:npx (?:--no )?)?kaal-guard list --undeclared(?: [^\s"'{}$#;&|<>]+)*$/;

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

/** The consistency check's declared form: a step whose whole `run:` value runs kaal-guard verify. */
const VERIFY = /^(?:- )?run: (?:npx (?:--no )?)?kaal-guard verify(?: --github)?$/;

/** What one job declares in Guard's declared form: the checks it names, and whether it runs the undeclared rest. */
function declared(job, all) {
  const names = new Set();
  let rest = false;
  for (const line of job.lines) {
    const name = INVOCATION.exec(line)?.[1];
    if (name !== "${{ matrix.check }}") {
      if (name) names.add(name);
      continue;
    }
    for (const entry of job.lines) ENTRY.test(entry) && names.add(ENTRY.exec(entry)[1]);
    const from = job.lines.map((l) => MATRIX.exec(l)?.[1]).find(Boolean);
    if (from && all.some((j) => j.key === from && j.lines.some((l) => LIST.test(l)))) rest = true;
  }
  return { names, rest };
}

/**
 * Every declaration in Guard's declared form in .github/workflows, in file and job order: { name, job,
 * file } for a check named, { name: "verify", verify: true, job, file } for the consistency check, and
 * { name: "undeclared", rest: true, job, file } for a job that runs every check no job names. The
 * lifecycle reads these to recognize a repository's existing integration (F17); nothing else does.
 */
export function declarations(root) {
  const dir = join(root, ".github", "workflows");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort() : [];
  const found = [];
  for (const file of files) {
    const all = jobs(readFileSync(join(dir, file), "utf8"));
    for (const job of all) {
      const at = { job: job.key, file: `.github/workflows/${file}` };
      const { names, rest } = declared(job, all);
      for (const name of names) found.push({ name, ...at });
      if (rest) found.push({ name: "undeclared", rest: true, ...at });
      if (job.lines.some((line) => VERIFY.test(line))) found.push({ name: "verify", verify: true, ...at });
    }
  }
  return found;
}

/** The ci checks that no job declares by name, in declaration order: what `kaal-guard list --undeclared` prints. */
export function undeclared(list, found) {
  const named = new Set(found.filter((d) => !d.verify && !d.rest).map((d) => d.name));
  return Object.keys(list.checks).filter((name) => list.checks[name].runs.includes("ci") && !named.has(name));
}

/** Writes `checks=<JSON list>` to the step's outputs file, for a matrix to read. */
export function output(names, file) {
  if (file) appendFileSync(file, `checks=${JSON.stringify(names)}\n`);
}

/**
 * Which ci checks in the list a job in .github/workflows declares in Guard's declared form. This is
 * declared integration only: that GitHub ran the job is CI execution evidence, and that GitHub requires
 * it is repository governance; verify establishes neither. Returns { results }, one per ci check.
 */
export function verify(root, list) {
  const found = declarations(root);
  const where = new Map();
  for (const d of found) if (!d.verify && !d.rest && !where.has(d.name)) where.set(d.name, `job ${d.job} in ${d.file}`);
  const rest = found.find((d) => d.rest);
  if (rest) for (const name of undeclared(list, found)) where.set(name, `job ${rest.job} in ${rest.file}, which runs each check kaal-guard list --undeclared names`);
  const ci = Object.keys(list.checks).filter((name) => list.checks[name].runs.includes("ci"));
  return {
    results: ci.map((name) =>
      where.has(name)
        ? { name, verdict: "pass", evidence: `declared by ${where.get(name)}; declared integration only, not that GitHub ran or requires that job` }
        : { name, verdict: "fail", evidence: "no workflow job declares it in Guard's declared form", do: `give a job the step "- run: npx --no kaal-guard run --check ${name} --github", and make that job required` }),
  };
}
