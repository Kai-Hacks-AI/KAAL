// The runner: runs a set of the repository's checks and reads their verdicts. It knows the declared
// checks (config.mjs) and the facts it is given, and nothing of branches, remotes, pull requests, hosting
// platforms or the adapters that call it. It reads Git objects only to take a trusted checker's files
// from the base revision (trusted.mjs).
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { plan, words } from "./command.mjs";
import { FACTS } from "./config.mjs";
import { materialize, redirect } from "./trusted.mjs";

export { FACTS };

/** The verdict of each exit status; any other status is cannot judge unless a check names it. */
const VERDICTS = { 0: "pass", 1: "fail", 2: "cannot judge", 3: "not applicable" };

/** The names of the checks a selection asks for: { local }, { ci } or { check: name }. */
export function select(list, selection) {
  if (selection.check !== undefined) return [selection.check];
  const where = selection.local ? "local" : "ci";
  return Object.keys(list.checks).filter((name) => list.checks[name].runs.includes(where));
}

const result = (name, verdict, evidence, todo) => ({ name, verdict, evidence, ...(todo ? { do: todo } : {}) });

/**
 * Runs one check from the repository root with no stdin, giving it only the facts supplied. The check's
 * output is its own: it goes, unchanged and as it runs, to Guard's standard error, and Guard does not read it.
 * `facts` maps fact names to values; `changed` is already an absolute path.
 */
export function runCheck(root, list, name, facts) {
  const check = list.checks[name];
  if (!check) return result(name, "cannot judge", "not declared", `declare ${name} as ${name}.md in the configuration directory, or name a declared check`);
  for (const fact of check.facts ?? []) {
    if (facts[fact] === undefined) return result(name, "cannot judge", `the fact ${fact} was not supplied`, `supply ${FACTS[fact].option}`);
  }
  let argv = words(check.command);
  let scratch;
  let provenance;
  try {
    if (check.trusted !== undefined) {
      if (facts.base === undefined) return result(name, "cannot judge", `its trusted checker ${check.trusted} needs the fact base, which was not supplied`, "supply --base");
      scratch = mkdtempSync(join(tmpdir(), "kaal-guard-trusted-"));
      const taken = materialize(root, facts.base, check.trusted, scratch);
      if (taken.problem) return result(name, "cannot judge", `trusted checker: ${taken.problem}`, taken.todo);
      provenance = `${check.trusted} from base ${taken.commit}`;
      argv = redirect(argv, check.trusted, scratch);
      if (!argv) return result(name, "cannot judge", `the command does not name its trusted checker ${check.trusted} as a word`, `name ${check.trusted} as an argument of the command`);
    }
    const started = plan(argv, { root });
    if (started.problem) return result(name, "cannot judge", started.problem, `call the program directly, or move the argument into a script`);
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GUARD_")));
    for (const [fact, value] of Object.entries(facts)) if (value !== undefined) env[FACTS[fact].variable] = value;
    const r = spawnSync(started.file, started.args, { ...started.options, cwd: root, env, stdio: ["ignore", 2, 2] });
    if (r.error || r.status === null) {
      return result(name, "cannot judge", `the command cannot start: ${r.error?.message ?? `ended by ${r.signal}`}`, `make "${check.command}" start from the repository root`);
    }
    const evidence = provenance ? `exit status ${r.status} (${provenance})` : `exit status ${r.status}`;
    const verdict = VERDICTS[r.status] ?? check.outcomes?.[r.status];
    if (verdict === "fail") return result(name, verdict, evidence, `fix what ${name} reports, then run kaal-guard run --check ${name}`);
    if (verdict === "cannot judge") return result(name, verdict, evidence, `fix the cause ${name} names; it blocks until ${name} can judge`);
    if (verdict) return result(name, verdict, evidence);
    return result(name, "cannot judge", `exit status ${r.status} is not a verdict${provenance ? ` (${provenance})` : ""}`, `make "${check.command}" start and exit 0 to 3, or name status ${r.status} under outcomes`);
  } finally {
    if (scratch) rmSync(scratch, { recursive: true, force: true });
  }
}

/** Runs the selected checks of the declared list in order. Returns { results }. */
export function run(root, list, selection, facts) {
  return { results: select(list, selection).map((name) => runCheck(root, list, name, facts)) };
}

/** The exit status of a run: 1 if any check fails, else 2 if any cannot judge, else 0. */
export function status(results) {
  if (results.some((r) => r.verdict === "fail")) return 1;
  if (results.some((r) => r.verdict === "cannot judge")) return 2;
  return 0;
}

/** The verdict lines of a run: `<verdict>: <check>: <evidence>`, a fail or cannot judge followed by `  do: …`. */
export function lines(results) {
  return results.flatMap((r) => [`${r.verdict}: ${r.name}: ${r.evidence}`, ...(r.do ? [`  do: ${r.do}`] : [])]);
}
