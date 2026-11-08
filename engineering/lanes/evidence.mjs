// A test lane that captures coverage evidence as it runs: each workspace's
// tests run once, through Engineering's coverage driver, which has Testing
// measure them under V8 coverage (c8, no source transformation). The driver's
// result for the workspace is written, with the provenance of the run, to
// <dir>/<workspace>/capture.json through Hosting. Nothing here reruns a test.
//
// The lane's status stays its tests' status. It fails when a workspace's tests
// fail, or when the driver gives no test status at all, since a status nobody
// observed is never a pass. A measurement that fails while the tests pass is
// recorded in the capture as a failed measurement and does not fail the lane:
// the evidence shows it, and the gate stays what it was.
//
// A capture names the run that took it, not only the commit: the GitHub
// Actions run and attempt, when there is one. Two runs of one commit are two
// runs, and a report reads only captures of its own (report/captures.mjs).
// Captures never overwrite each other: each is published whole, under
// Hosting's lock, as a directory that must not exist yet, so lanes capturing
// into one directory at once each add their own, and a second capture of a
// workspace is refused.
import { join } from "node:path";
import { execute, HostingError, initialize, kind, update } from "@kaihacksai/kaal-hosting";

const ROOT = process.cwd();

/** The commit this tree is at, or undefined when Git cannot say. */
export async function commit(root = ROOT) {
  const r = await execute("git", ["rev-parse", "HEAD"], { cwd: root });
  return r.status === 0 ? r.stdout.trim() : undefined;
}

/** The GitHub Actions run and attempt `env` names, or {} outside one. */
export function run(env = process.env) {
  return env.GITHUB_RUN_ID ? { run: env.GITHUB_RUN_ID, attempt: env.GITHUB_RUN_ATTEMPT } : {};
}

/**
 * Whether a driver result lets the lane pass: only a workspace whose tests ran
 * and passed. `result` is the driver's result for one workspace, or undefined
 * when it gave none.
 */
export function passes(result) {
  return result?.tests === "pass";
}

/** Run `name`'s tests once under coverage; the driver's result for it, or { workspace, failed } when it gave none. */
async function measureWorkspace(name) {
  const r = await execute(process.execPath, [join(ROOT, "engineering", "coverage", "measure.mjs"), "--json", name], { cwd: ROOT });
  process.stderr.write(r.stderr);
  try {
    const [result] = JSON.parse(r.stdout);
    if (result?.workspace === name) return result;
  } catch {
    // Fall through: no result is a failed measurement, and no test status.
  }
  return { workspace: name, failed: `${name}: the coverage driver gave no result (exited ${r.status})` };
}

/**
 * Run the tests of `names`, one workspace at a time, capturing each one's
 * evidence under `dir`, which may already hold other workspaces' captures but
 * none for these. Returns whether every workspace's tests passed. `measure`
 * runs one workspace's tests and resolves to the driver's result for it; it is
 * Engineering's coverage driver unless a test gives another.
 */
export async function lane(names, dir, measure = measureWorkspace) {
  if ((await kind(dir)) === "missing") {
    try {
      await initialize(dir, {});
    } catch (e) {
      // Another lane on this host may have created it first; anything else is real.
      if (!(e instanceof HostingError) || e.code !== "NOT_EMPTY") throw e;
    }
  }
  for (const name of names) if ((await kind(join(dir, name))) !== "missing") throw new Error(`${join(dir, name)} already holds evidence: capture into a fresh directory`);
  const provenance = { commit: await commit(), ...run(), platform: process.platform, arch: process.arch, node: process.version };
  let ok = true;
  for (const name of names) {
    const result = await measure(name);
    const capture = { workspace: name, provenance, result };
    await update(dir, () => ({ prefix: name, files: { "capture.json": Buffer.from(JSON.stringify(capture, null, 2) + "\n") } }));
    if (result.failed) console.error(`evidence: ${result.failed}`);
    if (!passes(result)) {
      console.error(`${name}: ${result.tests === "fail" ? "its tests failed" : "no test status was observed"}`);
      ok = false;
    }
  }
  return ok;
}

/** The value of `--evidence <dir>` in `args`, or undefined; exits with usage when the flag has no value. */
export function evidenceDir(args, usage) {
  const at = args.indexOf("--evidence");
  if (at < 0) return undefined;
  if (!args[at + 1] || args[at + 1].startsWith("--")) {
    console.error(usage);
    process.exit(2);
  }
  return args[at + 1];
}
