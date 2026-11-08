// The comprehensive lane's suites, each with its owner and context (engineering/C6).
//
// The lane follows the KAAL root's declared Test Plan, `engineering/lanes/plan.json`,
// and each workspace's own declared scripts. It runs every applicable suite once:
//   - Engineering: the root suites the plan names, under engineering/;
//   - Embedding: each workspace's `npm test`, and every `test:<suite>` it declares
//     that its `npm test` does not already run, each in the workspace's directory;
//   - External: the suites the plan declares for a KAAL-loaded agent serving
//     another repository, or the Owner's recorded reason that none applies.
// It copies, relocates and redefines no case (engineering/F1, engineering/N2). A
// workspace that declares no `test` entrypoint is never counted as verified (the
// Owner's safeguard on #625). A root test script the plan does not account for,
// and an External context with neither suites nor a recorded reason, are
// unresolved, never passed. Commands run through Hosting.
import { join } from "node:path";
import { execute, readFile } from "@kaihacksai/kaal-hosting";

/** Where the KAAL root declares its Test Plan, relative to the root. */
export const PLAN = "engineering/lanes/plan.json";

/** The workspace scripts that are the Embedded verification (packaging/F14). */
const EMBEDDED = ["test:embedded", "test:consumer"];

const json = async (path) => JSON.parse((await readFile(path)).toString("utf8"));

/** The suites a script names with `npm run <suite>`, read word by word. */
function named(script) {
  const words = script.split(/\s+/).filter(Boolean);
  const found = [];
  for (let i = 0; i < words.length; i++) {
    if (words[i] !== "npm") continue;
    let j = i + 1;
    while (j < words.length && words[j].startsWith("-")) j++;
    if (words[j] === "run" || words[j] === "run-script") found.push(words[j + 1]);
  }
  return found;
}

/** A `node --test <files>` command's preamble and files, or undefined when it is not one. */
function nodeTest(script) {
  const at = script.lastIndexOf("node --test ");
  if (at < 0) return undefined;
  const files = script.slice(at + "node --test ".length).split(/\s+/).filter(Boolean);
  return files.some((f) => f.startsWith("-") || f.includes("&")) ? undefined : { preamble: script.slice(0, at).trim(), files };
}

/**
 * Whether `test` runs the suite `name` as declared: it names it with `npm run`,
 * it is the same command, or both run `node --test` after the same preamble and
 * the suite's files are among the test's. Anything else is not shown to be
 * covered, and the suite runs on its own: a duplicate costs time, an omission
 * would be a false GREEN.
 */
export function covers(test, name, scripts) {
  const suite = scripts[name];
  if (named(test).includes(name) || suite.trim() === test.trim()) return true;
  const t = nodeTest(test);
  const s = nodeTest(suite);
  return t !== undefined && s !== undefined && t.preamble === s.preamble && s.files.every((f) => t.files.includes(f));
}

/**
 * Every suite of the declared Test Plan under `root`. Each is `{ owner, context,
 * location, script }`. One the lane does not run also carries its `status`:
 * "missing" (no entrypoint), "covered" (run by the suite in `by`),
 * "unresolved" or "not applicable", with its `cause`.
 */
export async function suites(root) {
  const pkg = await json(join(root, "package.json"));
  const plan = await json(join(root, PLAN));
  const list = [];

  for (const location of pkg.workspaces ?? []) {
    const w = await json(join(root, location, "package.json"));
    const scripts = w.scripts ?? {};
    const at = { owner: w.name, context: "embedding", location };
    if (scripts.test === undefined) list.push({ ...at, script: undefined, status: "missing", cause: "no test entrypoint, not verified" });
    else list.push({ ...at, script: "test" });
    for (const name of Object.keys(scripts).filter((n) => n.startsWith("test:"))) {
      const kind = EMBEDDED.includes(name) ? { embedded: true } : {};
      if (scripts.test !== undefined && covers(scripts.test, name, scripts)) list.push({ ...at, script: name, ...kind, status: "covered", by: "test" });
      else list.push({ ...at, script: name, ...kind });
    }
  }

  const engineering = { owner: "Engineering", context: "engineering", location: "engineering" };
  for (const script of plan.engineering ?? []) {
    if (pkg.scripts?.[script] === undefined) list.push({ ...engineering, script, status: "missing", cause: `the plan names ${script}, which the root does not declare` });
    else list.push({ ...engineering, script });
  }
  for (const script of Object.keys(pkg.scripts ?? {}).filter((n) => n.startsWith("test:"))) {
    if ((plan.engineering ?? []).includes(script)) continue;
    const by = plan.covered?.[script];
    if (by === undefined) list.push({ ...engineering, script, status: "unresolved", cause: `the root declares ${script}, which the Test Plan does not account for` });
    else list.push({ ...engineering, script, status: "covered", by });
  }

  const external = plan.external ?? {};
  for (const s of external.suites ?? []) list.push({ owner: s.owner, context: "external", location: s.location, script: s.script });
  if ((external.suites ?? []).length === 0) {
    if (typeof external.notApplicable === "string" && external.notApplicable.trim() !== "") list.push({ owner: "External", context: "external", location: undefined, script: undefined, status: "not applicable", cause: external.notApplicable });
    else list.push({ owner: "External", context: "external", location: undefined, script: undefined, status: "unresolved", cause: "no External Test Plan is declared, and no reason is recorded that none applies" });
  }
  return list;
}

/**
 * Run one suite under `root` and return it with its `status`: "passed" or
 * "failed" as its command exited. A suite that already carries a status is
 * returned as it is and nothing runs. A workspace's `npm test` runs without
 * `--if-present`, so a missing script can never pass silently.
 */
export async function runSuite(root, suite, { env } = {}) {
  if (suite.status !== undefined) return suite;
  let r;
  if (suite.context === "engineering") r = await execute("npm", ["run", suite.script], { cwd: root, env });
  else if (suite.context === "external") r = await execute("npm", ["run", suite.script], { cwd: join(root, suite.location), env });
  else if (suite.script === "test") r = await execute("npm", ["test", "-w", suite.owner], { cwd: root, env });
  else r = await execute("npm", ["run", suite.script, "-w", suite.owner], { cwd: root, env });
  return { ...suite, status: r.status === 0 ? "passed" : "failed", stdout: r.stdout, stderr: r.stderr };
}

/**
 * The lane's combined result: every suite as it reported, each with its owner,
 * context and location. The lane is "failed" when any suite failed or is
 * missing, else "unresolved" when any is unresolved, else "passed". Neither
 * owner's result stands for another's (engineering/F3).
 */
export function combine(results) {
  const result = results.some((r) => r.status === "failed" || r.status === "missing")
    ? "failed"
    : results.length === 0 || results.some((r) => r.status === "unresolved")
      ? "unresolved"
      : "passed";
  return {
    result,
    passed: result === "passed",
    suites: results.map(({ owner, context, location, script, status, by, cause }) => ({ owner, context, location, script, status, ...(by ? { by } : {}), ...(cause ? { cause } : {}) })),
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
    return { owner: workspace, context: "embedding", location, script, status: r.status === 0 ? "passed" : "failed", stdout: r.stdout, stderr: r.stderr };
  }
  throw new Error(`no workspace ${workspace}`);
}

/** One line per suite, for a person reading the lane's output. */
export function describe(result) {
  const lines = result.suites.map(({ owner, context, location, script, status, by, cause }) => {
    const what = `lane: ${context} ${owner}${location ? ` (${location})` : ""}${script ? ` ${script}` : ""}`;
    if (status === "covered") return `${what}: run by ${by}`;
    return `${what}: ${status}${cause ? `, ${cause}` : ""}`;
  });
  lines.push(`lane: ${result.result}`);
  return lines.join("\n");
}
