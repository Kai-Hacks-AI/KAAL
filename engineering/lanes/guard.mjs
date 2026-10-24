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
// Usage: guard.mjs [--planned] [--root <dir>]
// Exits with the tests' status, or 2 with an actionable diagnostic when it cannot select a suite, the
// suite cannot run, or it runs no test.
// Node built-ins only: the Windows and macOS Guard jobs run it before any install.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** The acceptance boundary directories, repository-relative (Guard Acceptance Boundary). */
export const BOUNDARY = ["packages/kaal-guard/test/acceptance", "engineering/guard/acceptance"];
/** kaal-guard's own tests outside the boundary, run in every state. */
export const UNIT = "packages/kaal-guard/test";

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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  let planned = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--planned") planned = true;
    else if (args[i] === "--root" && i + 1 < args.length) root = resolve(args[++i]);
    else {
      console.error("usage: guard.mjs [--planned] [--root <dir>]");
      process.exit(2);
    }
  }
  let chosen;
  try {
    chosen = select(root, { planned });
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
  console.log(`guard lane: the ${chosen.suite} suite ${r.status === 0 ? "passed" : "failed"}, ${ran} tests`);
  process.exit(r.status);
}
