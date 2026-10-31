// kaal-testing's `npm test` (testing/F62). It tells an installation from the source workspace explicitly, never
// from a missing file alone, and runs the declared `test:<name>` suites that apply there, never `test` itself:
// in an installation, `test:consumer` only; in the source workspace, every declared suite. With `--list` it runs
// nothing and prints one `kaal-testing-suite <script>` line per suite it would run. When the place cannot be
// told, the result is unknown (exit 2). Until it knows it is in the source workspace it loads only Node's
// built-ins, so a missing or broken runtime dependency of an installed copy never keeps the installed
// verification from diagnosing it (testing/F50, testing/F63). In the source workspace every command goes through
// Hosting.
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MARKERS = ["plan", "test/plan"];
const unknown = (reason) => {
  console.log(`kaal-testing: unknown: ${reason}`);
  process.exit(2);
};

let scripts;
try {
  scripts = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).scripts ?? {};
} catch {
  unknown("package.json cannot be read");
}
const parent = dirname(ROOT);
const installed = basename(parent) === "node_modules" || (basename(parent).startsWith("@") && basename(dirname(parent)) === "node_modules");
const present = MARKERS.filter((m) => existsSync(join(ROOT, m)));
if (installed && present.length) unknown(`an installed copy carries the source workspace's ${present.join(" and ")}`);
if (!installed && present.length < MARKERS.length) unknown(`not installed, and the source workspace's ${MARKERS.filter((m) => !present.includes(m)).join(" and ")} is missing`);
const declared = Object.keys(scripts).filter((k) => /^test:[a-z][a-z0-9-]*$/.test(k));
if (!declared.includes("test:consumer")) unknown("test:consumer is not declared");
const suites = installed ? ["test:consumer"] : [...declared.filter((s) => s !== "test:consumer"), "test:consumer"];
if (process.argv.includes("--list")) {
  for (const s of suites) console.log(`kaal-testing-suite ${s}`);
  process.exit(0);
}
// An installation runs its verification in this process: it imports only Node's built-ins and ends the process
// with its own result.
if (installed) await import("./verify.mjs");
else {
  const { execute } = await import("kaal-hosting");
  let failed = 0;
  for (const s of suites) {
    const r = await execute("npm", ["run", "--silent", s], { cwd: ROOT });
    process.stdout.write(r.stdout);
    process.stderr.write(r.stderr);
    if (r.status !== 0) failed++;
  }
  process.exit(failed ? 1 : 0);
}
