// The Guard test lane: kaal-guard's own tests and the acceptance suite that the required Guard jobs
// run, chosen by the configuration KAAL itself declares (engineering/guard/change.md, guard/C28,
// guard/C29). It is transitional: guard/C24 plans the new suite in plan/ beside the established one,
// guard/C25 implements it and converts KAAL's own declarations, and later Changes promote the suite
// and remove this lane.
//
//   guard.json only               the established suite: each boundary directory's own tests
//   .kaal/config/guard/ only      the planned suite: each boundary directory's plan/ tests
//   both, or neither              refused: KAAL declares its checks in exactly one form
//
// The planned suite is refused, never replaced by the established one, when a plan/ directory is
// absent, holds no test, or lacks a test the established suite has. --planned runs the planned suite
// whatever KAAL declares, for PLAN evidence. --root names the repository (default: this one).
//
// The lane runs every selected test as it is, with no marker, then judges the failures (guard/C45, the
// Owner's review 5643242085 on #381). A failure is held, never passed, only when it is a Feature RED
// that red.json registers for the branch the run targets: a planned Test Case, named by its identity, that a
// later Change turns GREEN. Every other failure fails the lane: one with no Test Case identity, one not
// registered for this branch, and every failure where the run targets another branch, as a promotion to
// main does. A registered Test Case that passes fails the lane too, until its entry is removed, and a todo
// or skip marker fails it as masking a result. The held run prints each RED and exits 0, as Guard's own
// held verdict does: KAAL's other held checks are reported the same way.
//
//   red.json absent                no failure is held
//   --target <ref>                 the branch the run targets; default: GITHUB_BASE_REF, else GITHUB_REF_NAME
//
// Usage: guard.mjs [--planned] [--root <dir>] [--target <ref>]
// Exits 0 when every test passes or every failure is held, 1 when the lane fails, or 2 with an actionable
// diagnostic when it cannot select a suite, read red.json, run the suite, or when it runs no test.
// Node built-ins only: the Windows and macOS Guard jobs run it before any install.
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** The acceptance boundary directories, repository-relative (Guard Acceptance Boundary). */
export const BOUNDARY = ["packages/kaal-guard/test/acceptance", "engineering/guard/acceptance"];
/** kaal-guard's own tests outside the boundary, run in every state. */
export const UNIT = "packages/kaal-guard/test";
/** The Feature REDs the lane holds, repository-relative (guard/C45). */
export const RED = "engineering/guard/red.json";

export class Refusal extends Error {
  /** @param {string} why @param {string} todo */
  constructor(why, todo) {
    super(why);
    this.todo = todo;
  }
}

const directory = (path) => existsSync(path) && statSync(path).isDirectory();

/** The *.test.mjs files directly in `dir`, sorted; none when it is not a directory. */
function tests(dir) {
  if (!directory(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".test.mjs"))
    .map((e) => e.name)
    .sort();
}

/**
 * The suite this repository's Guard lane runs.
 * @param {string} root the repository
 * @param {{ planned?: boolean }} [options]
 * @returns {{ suite: "established" | "planned", files: string[] }} files repository-relative
 */
export function select(root, { planned = false } = {}) {
  const legacy = existsSync(join(root, "guard.json"));
  const config = directory(join(root, ".kaal/config/guard"));
  if (!planned) {
    if (legacy && config) throw new Refusal("KAAL declares its Guard checks both in guard.json and in .kaal/config/guard/", "keep exactly one: guard/C25 converts KAAL and deletes guard.json in the same Change");
    if (!legacy && !config) throw new Refusal("KAAL declares no Guard checks: there is neither guard.json nor .kaal/config/guard/", "restore KAAL's declarations; the lane never runs without them");
  }
  const unit = tests(join(root, UNIT)).map((f) => `${UNIT}/${f}`);
  if (!planned && legacy) {
    const files = BOUNDARY.flatMap((d) => tests(join(root, d)).map((f) => `${d}/${f}`));
    if (files.length === 0) throw new Refusal("the established suite holds no test", `restore the tests in ${BOUNDARY.join(" and ")}`);
    return { suite: "established", files: [...unit, ...files] };
  }
  const files = [];
  for (const d of BOUNDARY) {
    const plan = `${d}/plan`;
    if (!directory(join(root, plan))) throw new Refusal(`the planned suite is absent: there is no ${plan}/`, "plan the new suite in its own boundary Change (guard/C24) before KAAL declares .kaal/config/guard/");
    const names = tests(join(root, plan));
    if (names.length === 0) throw new Refusal(`the planned suite is incomplete: ${plan}/ holds no test`, `complete ${plan}/ in its own boundary Change`);
    const missing = tests(join(root, d)).filter((f) => !names.includes(f));
    if (missing.length) throw new Refusal(`the planned suite is incomplete: ${plan}/ lacks ${missing.join(", ")}, which the established suite has`, `plan each of them in ${plan}/, or retire it there explicitly, in its own boundary Change`);
    files.push(...names.map((f) => `${plan}/${f}`));
  }
  return { suite: "planned", files: [...unit, ...files] };
}

/**
 * The Feature REDs `red.json` registers: { collector, entries: { [identity]: { until, authority } } },
 * none when the file is absent. A malformed register is refused, never read as empty.
 * @param {string} root
 */
export function register(root) {
  const path = join(root, RED);
  if (!existsSync(path)) return { collector: null, entries: {} };
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    throw new Refusal(`${RED} cannot be read: ${e.message}`, `make ${RED} valid JSON`);
  }
  const shape = `{ "collector": "kaal/<capability>", "entries": [{ "test": "guard/T<n>", "class": "Feature RED", "until": "<Change>", "authority": "<the Owner's review>" }] }`;
  if (!data || typeof data.collector !== "string" || !/^kaal\/[a-z0-9-]+$/.test(data.collector) || !Array.isArray(data.entries)) throw new Refusal(`${RED} is not a register`, `give it the shape ${shape}`);
  const entries = {};
  for (const e of data.entries) {
    const ok = e && typeof e.test === "string" && /^[a-z0-9-]+\/T\d+$/.test(e.test) && e.class === "Feature RED" && typeof e.until === "string" && e.until.trim() && typeof e.authority === "string" && e.authority.trim();
    if (!ok) throw new Refusal(`${RED} has an entry that is not a Feature RED with a Test Case identity, the Change it awaits and its authority: ${JSON.stringify(e)}`, `give every entry the shape in ${shape}`);
    if (entries[e.test]) throw new Refusal(`${RED} registers ${e.test} twice`, "register each Test Case once");
    entries[e.test] = { until: e.until, authority: e.authority };
  }
  return { collector: data.collector, entries };
}

/** A test name's Test Case identity, `<capability>/T<n>` at its start, or null. */
const identity = (name) => /^([a-z0-9-]+\/T\d+)\b/.exec(name)?.[1] ?? null;

/**
 * The results in node:test's TAP output: the identities of the tests that failed and passed, the failures
 * with no identity, and the tests a todo or skip marker masked. A suite that failed only because a test in
 * it failed is not counted again.
 * @param {string} tap
 */
export function outcomes(tap) {
  const failed = new Set(), passed = new Set(), unidentified = [], masked = [];
  const lines = tap.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = /^\s*(not ok|ok) \d+ - (.*)$/.exec(lines[i]);
    if (!m) continue;
    const directive = /\s# (TODO|SKIP)\b/i.exec(m[2]);
    const name = (directive ? m[2].slice(0, directive.index) : m[2]).replace(/\\#/g, "#").trim();
    let failure = "";
    for (let j = i + 1; j < lines.length && !/^\s*(not )?ok \d+ - /.test(lines[j]); j++) {
      const f = /^\s*failureType: '([^']+)'/.exec(lines[j]);
      if (f) failure = f[1];
      if (/^\s*\.\.\.\s*$/.test(lines[j])) break;
    }
    if (directive) masked.push(name);
    else if (m[1] === "ok") identity(name) && passed.add(identity(name));
    else if (failure === "subtestsFailed") continue;
    else if (identity(name)) failed.add(identity(name));
    else unidentified.push(name);
  }
  return { failed, passed, unidentified, masked };
}

/**
 * Judges a run's outcomes against the register for the branch it targets.
 * @returns {{ status: 0 | 1, held: string[], unregistered: string[], stale: string[], awaiting: string[], reasons: string[] }}
 */
export function judge({ failed, passed, unidentified, masked }, { collector, entries }, target, status) {
  const accepted = collector && collector === target ? entries : {};
  const held = [...failed].filter((t) => accepted[t]).sort();
  const unregistered = [...failed].filter((t) => !accepted[t]).sort();
  const stale = Object.keys(accepted).filter((t) => passed.has(t)).sort();
  const awaiting = Object.keys(accepted).filter((t) => !failed.has(t) && !passed.has(t)).sort();
  const reasons = [
    ...unidentified.map((n) => `a failure with no Test Case identity: ${n}`),
    ...masked.map((n) => `a todo or skip marker masks a result: ${n}`),
    ...unregistered.map((t) => `${t} failed and is not a Feature RED registered for ${target || "this run"}`),
    ...stale.map((t) => `${t} passes but ${RED} still registers it`),
  ];
  // A failing run with no failure found is never held: the lane cannot see what failed.
  if (status !== 0 && failed.size + unidentified.length === 0) reasons.push("the suite failed, and no failing test can be named");
  return { status: reasons.length || (status !== 0 && held.length === 0) ? 1 : 0, held, unregistered, stale, awaiting, reasons };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  let planned = false;
  let target = process.env.GITHUB_BASE_REF || process.env.GITHUB_REF_NAME || "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--planned") planned = true;
    else if (args[i] === "--root" && i + 1 < args.length) root = resolve(args[++i]);
    else if (args[i] === "--target" && i + 1 < args.length) target = args[++i];
    else {
      console.error("usage: guard.mjs [--planned] [--root <dir>] [--target <ref>]");
      process.exit(2);
    }
  }
  let chosen, reds;
  try {
    chosen = select(root, { planned });
    reds = register(root);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`guard lane: cannot select a suite: ${e.message}`);
    console.error(`  do: ${e.todo}`);
    if (process.env.GITHUB_ACTIONS === "true") console.log(`::error title=Guard lane: cannot select a suite::${e.message}`);
    process.exit(2);
  }
  console.log(`guard lane: the ${chosen.suite} suite, ${chosen.files.length} files`);
  // An inherited NODE_TEST_CONTEXT makes node --test skip every file and pass; the lane never inherits it.
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, ["--test", "--test-reporter=tap", ...chosen.files.map((f) => join(root, f))], { cwd: root, env, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], maxBuffer: 1 << 28 });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.error || r.status === null) {
    console.error(`guard lane: the ${chosen.suite} suite could not run: ${r.error?.message ?? `signal ${r.signal}`}`);
    process.exit(2);
  }
  const ran = Number(/^# tests (\d+)$/m.exec(r.stdout ?? "")?.[1] ?? 0);
  if (ran === 0) {
    console.error(`guard lane: the ${chosen.suite} suite ran no test`);
    console.error("  do: make its files load and declare their tests; a lane that runs nothing never passes");
    process.exit(2);
  }
  const verdict = judge(outcomes(r.stdout ?? ""), reds, target, r.status);
  const github = process.env.GITHUB_ACTIONS === "true";
  const rows = [];
  for (const t of verdict.held) {
    const { until, authority } = reds.entries[t];
    console.log(`RED: ${t}: Feature RED until ${until} (${authority})`);
    if (github) console.log(`::warning title=Feature RED ${t}::held, not passed: RED until ${until} (${authority})`);
    rows.push(`| ${t} | Feature RED, held | ${until} |`);
  }
  for (const t of verdict.awaiting) console.log(`awaiting its PLAN: ${t}: registered until ${reds.entries[t].until}, not yet written`);
  for (const why of verdict.reasons) {
    console.log(`not held: ${why}`);
    if (github) console.log(`::error title=Guard lane::${why}`);
  }
  if (verdict.status !== 0) {
    console.log(`guard lane: the ${chosen.suite} suite failed, ${ran} tests`);
    if (verdict.reasons.length) console.log(`  do: make each failure pass, or register a planned Test Case's Feature RED for ${reds.collector ?? "its collector"} in ${RED} with the Owner's authority; a promotion holds none`);
  } else if (verdict.held.length) {
    console.log(`held: Guard lane: the ${chosen.suite} suite has ${verdict.held.length} registered Feature REDs and no other failure, ${ran} tests`);
  } else {
    console.log(`guard lane: the ${chosen.suite} suite passed, ${ran} tests`);
  }
  if (github && process.env.GITHUB_STEP_SUMMARY && (verdict.held.length || verdict.reasons.length)) {
    const summary = ["### Guard lane", "", `${verdict.status === 0 ? "held" : "failed"}: ${verdict.held.length} registered Feature REDs, ${verdict.reasons.length} other failures (target ${target || "none"})`, ""];
    if (rows.length) summary.push("| Test Case | Result | GREEN in |", "| --- | --- | --- |", ...rows, "");
    for (const why of verdict.reasons) summary.push(`- not held: ${why}`);
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary.join("\n")}\n`);
  }
  process.exit(verdict.status);
}
