// kaal-testing's `npm test` (testing/F62). It tells an installation from the source workspace explicitly, never
// from a missing file alone, and runs the declared `test:<name>` suites that apply there, never `test` itself:
// in an installation, `test:consumer` only; in the source workspace, every declared suite. With `--list` it runs
// nothing and prints one `kaal-testing-suite <script>` line per suite it would run. When the place cannot be
// told, the result is unknown (exit 2). Every command goes through Hosting.
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execute, kind, readFile } from "kaal-hosting";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MARKERS = ["plan", "test/plan"];
const unknown = (reason) => {
  console.log(`kaal-testing: unknown: ${reason}`);
  process.exit(2);
};

let scripts;
try {
  scripts = JSON.parse((await readFile(join(ROOT, "package.json"))).toString("utf8")).scripts ?? {};
} catch {
  unknown("package.json cannot be read");
}
const parent = dirname(ROOT);
const installed = basename(parent) === "node_modules" || (basename(parent).startsWith("@") && basename(dirname(parent)) === "node_modules");
const present = [];
for (const m of MARKERS) if ((await kind(join(ROOT, m))) !== "missing") present.push(m);
if (installed && present.length) unknown(`an installed copy carries the source workspace's ${present.join(" and ")}`);
if (!installed && present.length < MARKERS.length) unknown(`not installed, and the source workspace's ${MARKERS.filter((m) => !present.includes(m)).join(" and ")} is missing`);
const declared = Object.keys(scripts).filter((k) => /^test:[a-z][a-z0-9-]*$/.test(k));
if (!declared.includes("test:consumer")) unknown("test:consumer is not declared");
const suites = installed ? ["test:consumer"] : [...declared.filter((s) => s !== "test:consumer"), "test:consumer"];
if (process.argv.includes("--list")) {
  for (const s of suites) console.log(`kaal-testing-suite ${s}`);
  process.exit(0);
}
let failed = 0;
let worst = 0;
for (const s of suites) {
  const r = await execute("npm", ["run", "--silent", s], { cwd: ROOT });
  process.stdout.write(r.stdout);
  process.stderr.write(r.stderr);
  if (r.status !== 0) { failed++; worst = Math.max(worst, r.status === 2 ? 2 : 1); }
}
process.exit(failed ? (installed ? worst : 1) : 0);
