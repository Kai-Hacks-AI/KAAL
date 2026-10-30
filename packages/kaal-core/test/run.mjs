#!/usr/bin/env node
// kaal-core's `npm test` (core/F75, core/A34). It tells an installation from the source workspace
// explicitly, then runs the declared `test:<name>` suites that apply there, never `test` itself.
// Installed: `test:consumer` alone, with its result. Source: every declared suite, in order.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MARKERS = ["src", "test/plan"];

/** Ends the run as `cannot verify` (exit 2), naming why, before any suite runs. */
const refuse = (reason) => {
  console.log(`kaal-core: cannot verify: ${reason}`);
  process.exit(2);
};

/** True when the package directory's real path sits directly in a node_modules directory. */
const installedAt = (dir) => {
  const real = realpathSync(dir);
  const parent = dirname(real);
  if (basename(parent) === "node_modules") return true;
  return basename(parent).startsWith("@") && basename(dirname(parent)) === "node_modules";
};

let scripts;
try {
  scripts = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).scripts ?? {};
} catch {
  refuse("package.json cannot be read");
}
const suites = Object.keys(scripts).filter((name) => name.startsWith("test:"));
const present = MARKERS.filter((m) => existsSync(join(ROOT, m)));
const installed = installedAt(ROOT);

if (suites.length === 0) refuse("no test:<name> suite is declared");
if (!suites.includes("test:consumer")) refuse("test:consumer is not declared");
if (installed && present.length > 0) refuse(`an installed package carries the source marker ${present.join(" and ")}`);
if (!installed && present.length < MARKERS.length) refuse(`not installed, and the source marker ${MARKERS.filter((m) => !present.includes(m)).join(" and ")} is missing`);
if (!installed && !suites.includes("test:publisher")) refuse("test:publisher is not declared in the source workspace");

const npm = (suite) => spawnSync("npm", ["run", "--silent", suite], { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" }).status ?? 1;

if (installed) process.exit(npm("test:consumer"));
let failed = 0;
for (const suite of suites) if (npm(suite) !== 0) failed++;
process.exit(failed === 0 ? 0 : 1);
