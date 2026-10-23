// The runner: runs a set of the repository's checks and reads their verdicts. It knows the check list
// (guard.json) and the facts it is given, and nothing of branches, remotes, pull requests, hosting
// platforms or the adapters that call it. It reads Git objects only to take a trusted checker from
// the base commit (trusted.mjs).
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { plan, words } from "./command.mjs";
import { materialize, redirect, safePath } from "./trusted.mjs";

/** The verdict of each exit status; any other status is cannot judge unless a check names it. */
const VERDICTS = { 0: "pass", 1: "fail", 2: "cannot judge", 3: "not applicable" };

/** The only named outcome a check may declare for a further exit status. */
const NAMED = new Set(["held"]);

/** The facts an adapter may supply: the name a check declares, its option and its variable. */
export const FACTS = {
  head: { option: "--head", variable: "GUARD_HEAD" },
  base: { option: "--base", variable: "GUARD_BASE" },
  "base-ref": { option: "--base-ref", variable: "GUARD_BASE_REF" },
  changed: { option: "--changed", variable: "GUARD_CHANGED" },
};

/** The nearest directory, from `start` upwards, that holds guard.json: the repository root. */
export function findRoot(start) {
  for (let dir = resolve(start); ; dir = dirname(dir)) {
    if (existsSync(join(dir, "guard.json"))) return dir;
    if (dirname(dir) === dir) return undefined;
  }
}

/** Reads and checks guard.json. Returns { list } or { problem }. */
export function readList(root) {
  let list;
  try {
    list = JSON.parse(readFileSync(join(root, "guard.json"), "utf8"));
  } catch (e) {
    return { problem: `guard.json cannot be read: ${e.message}` };
  }
  if (!list || typeof list !== "object" || !list.checks || typeof list.checks !== "object" || Array.isArray(list.checks)) {
    return { problem: "guard.json has no checks object" };
  }
  for (const [name, check] of Object.entries(list.checks)) {
    if (!/^[^:\s]+$/.test(name)) return { problem: `guard.json names a check "${name}"; a name has no spaces or colons` };
    if (!check || typeof check.command !== "string" || !words(check.command)?.length) return { problem: `${name} has no command, or its quotes are not closed` };
    if (!Array.isArray(check.runs) || !check.runs.every((r) => r === "local" || r === "ci")) return { problem: `${name}: runs must list local, ci or both` };
    if (check.facts !== undefined && !(Array.isArray(check.facts) && check.facts.every((f) => f in FACTS))) {
      return { problem: `${name}: facts may name only ${Object.keys(FACTS).join(", ")}` };
    }
    if (check.trusted !== undefined && !safePath(check.trusted)) return { problem: `${name}: trusted must name a file or directory inside the repository` };
    for (const [status, outcome] of Object.entries(check.outcomes ?? {})) {
      if (!/^\d+$/.test(status) || status in VERDICTS || !NAMED.has(outcome)) return { problem: `${name}: outcomes may only name a further exit status held` };
    }
  }
  return { list };
}

/** The names of the checks a selection asks for: { local }, { ci } or { check: name }. */
export function select(list, selection) {
  if (selection.check !== undefined) return [selection.check];
  const where = selection.local ? "local" : "ci";
  return Object.keys(list.checks).filter((name) => list.checks[name].runs.includes(where));
}

const result = (name, verdict, evidence, todo) => ({ name, verdict, evidence, ...(todo ? { do: todo } : {}) });

/** The check's own output as one line of evidence. */
const evidenceOf = (output) => output.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join(" / ");

/**
 * Runs one check from the repository root with no stdin, giving it only the facts supplied.
 * `facts` maps fact names to values; `changed` is already an absolute path.
 */
export function runCheck(root, list, name, facts) {
  const check = list.checks[name];
  if (!check) return result(name, "cannot judge", "not in guard.json", `add ${name} to guard.json, or name a check it lists`);
  for (const fact of check.facts ?? []) {
    if (facts[fact] === undefined) return result(name, "cannot judge", `the fact ${fact} was not supplied`, `supply ${FACTS[fact].option}`);
  }
  let argv = words(check.command);
  let scratch;
  try {
    if (check.trusted !== undefined) {
      if (facts.base === undefined) return result(name, "cannot judge", `its trusted checker ${check.trusted} needs the fact base, which was not supplied`, "supply --base");
      scratch = mkdtempSync(join(tmpdir(), "kaal-guard-trusted-"));
      const taken = materialize(root, facts.base, check.trusted, scratch);
      if (taken.problem) return result(name, "cannot judge", `trusted checker: ${taken.problem}`, taken.todo);
      argv = redirect(argv, check.trusted, scratch);
      if (!argv) return result(name, "cannot judge", `the command does not name its trusted checker ${check.trusted} as a word`, `name ${check.trusted} as an argument of the command`);
    }
    const started = plan(argv, { root });
    if (started.problem) return result(name, "cannot judge", started.problem, `call the program directly, or move the argument into a script`);
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GUARD_")));
    for (const [fact, value] of Object.entries(facts)) if (value !== undefined) env[FACTS[fact].variable] = value;
    const r = spawnSync(started.file, started.args, { ...started.options, cwd: root, env, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
    if (r.error || r.status === null) {
      return result(name, "cannot judge", `the command cannot start: ${r.error?.message ?? `ended by ${r.signal}`}`, `make "${check.command}" start from the repository root`);
    }
    const evidence = evidenceOf(`${r.stdout}${r.stderr}`) || `exit status ${r.status}`;
    const verdict = VERDICTS[r.status] ?? check.outcomes?.[r.status];
    if (verdict === "fail") return result(name, verdict, evidence, `fix what ${name} reports, then run kaal-guard run --check ${name}`);
    if (verdict === "cannot judge") return result(name, verdict, evidence, `fix the cause ${name} names; it blocks until ${name} can judge`);
    if (verdict) return result(name, verdict, evidence);
    return result(name, "cannot judge", `exit status ${r.status} is not a verdict: ${evidence}`, `make "${check.command}" start and exit 0 to 3, or name status ${r.status} under outcomes`);
  } finally {
    if (scratch) rmSync(scratch, { recursive: true, force: true });
  }
}

/** Runs the selected checks in order. Returns { results } or { problem } when guard.json cannot be used. */
export function run(root, selection, facts) {
  const { list, problem } = readList(root);
  if (problem) return { problem };
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
