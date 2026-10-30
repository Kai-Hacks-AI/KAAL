// The comprehensive lane's suites, each with its owner (engineering/C6).
//
// Engineering Tests live under engineering/ and run there, through the root
// scripts Engineering owns. Embedded Tests live in each workspace and run
// through that workspace's own `npm test`, in its own directory. This module
// orchestrates both and combines their results without copying, relocating or
// redefining a case of either (engineering/F1, engineering/N2). A workspace
// that declares no `test` entrypoint is reported as such and is never counted
// as verified: no package contract allows the absence today, so it fails the
// lane (the Owner's safeguard on #625). Commands run through Hosting.
import { join } from "node:path";
import { execute, readFile } from "kaal-hosting";

/** The root scripts that run Engineering Tests, in the order the lane runs them. */
export const ENGINEERING_SCRIPTS = ["test:acceptance", "test:engineering"];

const json = async (path) => JSON.parse((await readFile(path)).toString("utf8"));

/**
 * Every suite the comprehensive lane runs under `root`: each workspace's own
 * `npm test`, then Engineering's own suites. Each is `{ owner, location,
 * script }`, where `script` is undefined when the owner declares none.
 */
export async function suites(root) {
  const pkg = await json(join(root, "package.json"));
  const list = [];
  for (const location of pkg.workspaces ?? []) {
    const w = await json(join(root, location, "package.json"));
    list.push({ owner: w.name, location, script: w.scripts?.test === undefined ? undefined : "test" });
  }
  for (const script of ENGINEERING_SCRIPTS) list.push({ owner: "Engineering", location: "engineering", script: pkg.scripts?.[script] === undefined ? undefined : script });
  return list;
}

/**
 * Run one suite under `root` and return it with its `status`: "passed" or
 * "failed" as its command exited, or "missing" when its owner declares no
 * entrypoint, which is never a pass. A workspace's `npm test` runs without
 * `--if-present`, so a missing script can never pass silently.
 */
export async function runSuite(root, suite, { env } = {}) {
  if (suite.script === undefined) return { ...suite, status: "missing" };
  const args = suite.owner === "Engineering" ? ["run", suite.script] : ["test", "-w", suite.owner];
  const r = await execute("npm", args, { cwd: root, env });
  return { ...suite, status: r.status === 0 ? "passed" : "failed", stdout: r.stdout, stderr: r.stderr };
}

/**
 * The lane's combined result: every suite as it reported, each with its
 * owner and location, and `passed` only when every one of them passed.
 * Neither owner's result stands for the other's (engineering/F3).
 */
export function combine(results) {
  return {
    passed: results.length > 0 && results.every((r) => r.status === "passed"),
    suites: results.map(({ owner, location, script, status }) => ({ owner, location, script, status })),
  };
}

/** Run every suite under `root`, one at a time and each to its end, and combine them. */
export async function comprehensive(root, { env } = {}) {
  const results = [];
  for (const suite of await suites(root)) results.push(await runSuite(root, suite, { env }));
  return { ...combine(results), results };
}

/**
 * Run exactly the suite `test:<name>` that `workspace` declares under `root`
 * (engineering/F2). A suite the workspace does not declare is refused, naming
 * it, and nothing else runs in its place.
 */
export async function select(root, workspace, name, { env } = {}) {
  const pkg = await json(join(root, "package.json"));
  for (const location of pkg.workspaces ?? []) {
    const w = await json(join(root, location, "package.json"));
    if (w.name !== workspace) continue;
    const script = `test:${name}`;
    if (w.scripts?.[script] === undefined) throw new Error(`${workspace} declares no suite ${script}`);
    const r = await execute("npm", ["run", script, "-w", workspace], { cwd: root, env });
    return { owner: workspace, location, script, status: r.status === 0 ? "passed" : "failed", stdout: r.stdout, stderr: r.stderr };
  }
  throw new Error(`no workspace ${workspace}`);
}

/** One line per suite, for a person reading the lane's output. */
export function describe(result) {
  const lines = result.suites.map(({ owner, location, script, status }) => `lane: ${owner} (${location}) ${script ?? "test"}: ${status === "missing" ? "no test entrypoint, not verified" : status}`);
  lines.push(`lane: ${result.passed ? "passed" : "failed"}`);
  return lines.join("\n");
}
