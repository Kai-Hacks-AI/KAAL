#!/usr/bin/env node
// kaal-core's `npm test` (core/F75, core/A34). It tells an installation from the source workspace
// explicitly, then runs the declared `test:<name>` suites that apply there, never `test` itself.
// Installed: `test:consumer` alone, with its result. Source: every declared suite, in order.
// Every host operation, running npm included, goes through kaal-hosting, KAAL's only OS boundary.
import { execute, kind, readFile } from "kaal-hosting";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Node resolves the entry module's links, so this is the package directory's real path.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MARKERS = ["src", "test/plan"];

/** Ends the run as `cannot verify` (exit 2), naming why, before any suite runs. */
const refuse = (reason) => {
  console.log(`kaal-core: cannot verify: ${reason}`);
  process.exit(2);
};

/** True when the package directory sits directly in a node_modules directory. */
const installedAt = (dir) => {
  const parent = dirname(dir);
  if (basename(parent) === "node_modules") return true;
  return basename(parent).startsWith("@") && basename(dirname(parent)) === "node_modules";
};

let scripts;
try {
  scripts = JSON.parse((await readFile(join(ROOT, "package.json"))).toString("utf8")).scripts ?? {};
} catch {
  refuse("package.json cannot be read");
}
const suites = Object.keys(scripts).filter((name) => name.startsWith("test:"));
const present = [];
for (const m of MARKERS) if ((await kind(join(ROOT, m))) !== "missing") present.push(m);
const installed = installedAt(ROOT);

if (suites.length === 0) refuse("no test:<name> suite is declared");
if (!suites.includes("test:consumer")) refuse("test:consumer is not declared");
if (installed && present.length > 0) refuse(`an installed package carries the source marker ${present.join(" and ")}`);
if (!installed && present.length < MARKERS.length) refuse(`not installed, and the source marker ${MARKERS.filter((m) => !present.includes(m)).join(" and ")} is missing`);
if (!installed && !suites.includes("test:publisher")) refuse("test:publisher is not declared in the source workspace");

/** Runs one suite through Hosting, passes on what it wrote, and returns its status; one that cannot run fails. */
const npm = async (suite) => {
  try {
    const { status, stdout, stderr } = await execute("npm", ["run", "--silent", suite], { cwd: ROOT });
    process.stdout.write(stdout);
    process.stderr.write(stderr);
    return status;
  } catch (e) {
    console.error(`kaal-core: ${suite} could not run: ${e instanceof Error ? e.message : e}`);
    return 1;
  }
};

if (installed) process.exit(await npm("test:consumer"));
let failed = 0;
for (const suite of suites) if ((await npm(suite)) !== 0) failed++;
process.exit(failed === 0 ? 0 : 1);
