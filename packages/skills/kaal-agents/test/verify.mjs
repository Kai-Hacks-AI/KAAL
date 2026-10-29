// The consumer's verification of the installed package (agents/F7, agents/A5): what
// `npm explore kaal-agents -- npm test` runs. It checks the prerequisites, the installed files
// against the shipped manifest (test/verify.json), and runs every delivered consumer case, then
// ends in exactly one result: verified (exit 0), failed (1) or cannot verify (2). It realizes
// Testing's consumer-verification semantics in Agents' own code, after Guard's, without importing
// either; it imports nothing from lib/, so a broken runtime cannot mask itself, and uses only
// Node's built-ins (agents/N1).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { run } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The copy of the package this entry ships in. */
export const PACKAGE = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), ".."));

/** The shipped manifest, relative to the package: the delivered cases and every other shipped file's SHA-256. */
export const MANIFEST = "test/verify.json";

/** The exit status of each result. */
export const EXIT = { verified: 0, failed: 1, "cannot verify": 2 };

/** Files npm ships whatever `files` says. */
const ALWAYS = ["package.json", "README.md", "LICENSE"];

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const slash = (p) => p.split(sep).join("/");

/**
 * The SHA-256 of every shipped file in the copy, by path, except the manifest itself: what
 * `files` lists, and what npm always ships. Anything else in the directory, such as a source
 * checkout's own tests, is not the package's.
 */
export function hashes(base = PACKAGE) {
  const pkg = JSON.parse(readFileSync(join(base, "package.json"), "utf8"));
  const out = {};
  const add = (path) => {
    const file = join(base, path);
    if (!existsSync(file)) return;
    if (statSync(file).isDirectory()) {
      for (const e of readdirSync(file, { recursive: true })) if (statSync(join(file, e)).isFile()) out[slash(join(path, e))] = null;
    } else out[slash(path)] = null;
  };
  for (const path of [...ALWAYS, ...(pkg.files ?? [])]) add(path);
  delete out[MANIFEST];
  return Object.fromEntries(Object.keys(out).sort().map((f) => [f, sha256(readFileSync(join(base, f)))]));
}

/** A case's name: its file in the package, then each enclosing suite, then the test, joined by " > ". */
export const key = (file, path) => [slash(relative(PACKAGE, file)), ...path].join(" > ");

/**
 * Runs the case files and accounts for each leaf test by its name. A file that fails outside any
 * test counts as a failure under the file's own name.
 */
export async function execute(caseFiles) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const stacks = new Map();
  const outcomes = [];
  for await (const e of run({ files: caseFiles, concurrency: true, env })) {
    const d = e.data ?? {};
    if (e.type === "test:start") {
      const stack = stacks.get(d.file) ?? [];
      stack.length = d.nesting;
      stack.push(d.name);
      stacks.set(d.file, stack);
      continue;
    }
    if (e.type !== "test:pass" && e.type !== "test:fail") continue;
    const whole = d.nesting === 0 && d.file && resolve(d.name) === resolve(d.file);
    if (whole && e.type === "test:pass") continue;
    if (!whole && d.details?.type !== "test") continue;
    const name = whole ? key(d.file, []) : key(d.file, [...(stacks.get(d.file) ?? []).slice(0, d.nesting), d.name]);
    const skipped = (d.skip !== undefined && d.skip !== false) || (d.todo !== undefined && d.todo !== false);
    const status = skipped ? "skipped" : e.type === "test:pass" ? "passed" : "failed";
    const error = d.details?.error;
    outcomes.push({ name, status, message: status === "failed" ? String(error?.cause?.message ?? error?.message ?? "failed").split(/\r?\n/)[0] : undefined });
  }
  return outcomes;
}

/** What must be present before any case can run. */
function prerequisites() {
  const missing = [];
  if (Number(process.versions.node.split(".")[0]) < 24) missing.push(`Node ${process.versions.node} is older than the required 24`);
  if (spawnSync("git", ["--version"], { encoding: "utf8" }).status !== 0) missing.push("git is not on PATH");
  return missing;
}

/** Runs the verification, prints its output, and returns the result. */
export async function main(log = (line) => console.log(line)) {
  const failed = [];
  const unknown = [];
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
  } catch (e) {
    unknown.push(`package.json cannot be read: ${e.message}`);
  }
  log(`kaal-agents verification: ${pkg ? `${pkg.name}@${pkg.version}` : "an unreadable package"}, the installed package only`);
  log(`location: ${PACKAGE}`);
  for (const cause of prerequisites()) unknown.push(cause);

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(PACKAGE, MANIFEST), "utf8"));
    if (!Array.isArray(manifest.cases) || !manifest.files || typeof manifest.files !== "object") throw new Error("it lists no cases and files");
  } catch (e) {
    unknown.push(`${MANIFEST} cannot be read: ${e.message}`);
    manifest = undefined;
  }

  if (manifest && pkg) {
    const installed = hashes();
    const expected = manifest.files;
    const differ = Object.keys(expected).filter((f) => f in installed && installed[f] !== expected[f]).sort();
    const absent = Object.keys(expected).filter((f) => !(f in installed)).sort();
    const extra = Object.keys(installed).filter((f) => !(f in expected)).sort();
    for (const f of differ) failed.push(`a shipped file differs from the manifest: ${f}`);
    for (const f of absent) failed.push(`a shipped file is missing: ${f}`);
    for (const f of extra) failed.push(`a file the manifest does not ship: ${f}`);
    log(`files: ${Object.keys(installed).length} checked, ${differ.length} differ, ${absent.length} missing, ${extra.length} not in the manifest`);
  }

  if (manifest && manifest.cases.length === 0) unknown.push("the manifest declares no cases, and zero cases verify nothing");
  else if (manifest && unknown.length === 0) {
    const declared = new Set(manifest.cases);
    const caseFiles = [...new Set(manifest.cases.map((c) => c.split(" > ")[0]))].sort();
    const present = caseFiles.filter((f) => existsSync(join(PACKAGE, f)));
    const outcomes = present.length ? await execute(present.map((f) => join(PACKAGE, f))) : [];
    const seen = new Set();
    for (const o of outcomes) {
      seen.add(o.name);
      if (o.status === "failed") failed.push(`failed: ${o.name}${o.message ? `: ${o.message}` : ""}`);
      else if (!declared.has(o.name)) failed.push(`a case ran that the manifest does not declare: ${o.name}`);
      else if (o.status === "skipped") unknown.push(`not executed: ${o.name}`);
    }
    for (const c of manifest.cases) if (!seen.has(c)) unknown.push(`a declared case did not run: ${c}`);
    const passed = outcomes.filter((o) => o.status === "passed" && declared.has(o.name)).length;
    log(`cases: ${manifest.cases.length} declared, ${passed} passed`);
  }

  for (const cause of failed) log(`failed: ${cause}`);
  for (const cause of unknown) log(`cannot verify: ${cause}`);
  const result = failed.length ? "failed" : unknown.length ? "cannot verify" : "verified";
  log(result === "verified" ? `verified: every declared case ran and passed against the shipped files` : `${result}: ${failed.length + unknown.length} cause(s) above`);
  return result;
}

if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
  process.exitCode = EXIT[await main()];
}
