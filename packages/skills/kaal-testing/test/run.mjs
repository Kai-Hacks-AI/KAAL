// kaal-testing's `npm test` (testing/F62). It tells an installation from the source workspace explicitly, never
// from a missing file alone, and runs the declared `test:<name>` suites that apply there, never `test` itself:
// in an installation, `test:consumer` only; in the source workspace, every declared suite. With `--list` it runs
// nothing and prints one `kaal-testing-suite <script>` line per suite it would run. When the place cannot be
// told, the result is unknown (exit 2). Until it knows it is in the source workspace it loads only Node's
// built-ins, so a missing or broken runtime dependency of an installed copy never keeps the installed
// verification from diagnosing it (testing/F50, testing/F63). In the source workspace it builds Hosting if it is not
// built yet, then every command goes through Hosting, and the suites' results aggregate in three states.
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
  // Hosting ships built: in a fresh source checkout it is built once, before it is loaded, by this one bootstrap
  // step; every command after it goes through Hosting.
  let hosting;
  try {
    hosting = await import("kaal-hosting");
  } catch {
    const { spawnSync } = await import("node:child_process");
    const npm = process.env.npm_execpath ? [process.execPath, [process.env.npm_execpath]] : ["npm", []];
    const built = spawnSync(npm[0], [...npm[1], "run", "--silent", "build", "-w", "kaal-core", "-w", "kaal-hosting"], { cwd: ROOT, stdio: "inherit", shell: !process.env.npm_execpath });
    if (built.status !== 0) unknown("the source workspace's Hosting cannot be built");
    try {
      hosting = await import("kaal-hosting");
    } catch (e) {
      unknown(`Hosting cannot be loaded (${e.code ?? e.message})`);
    }
  }
  // Each suite ends verified (0), failed (1) or unknown (2), as Testing's own results do. Any other end, or
  // none, is unknown: the run is failed when a suite established a failure, otherwise unknown when any suite
  // could not verify, and verified only when every suite verified.
  const ends = [];
  for (const s of suites) {
    let r;
    try {
      r = await hosting.execute("npm", ["run", "--silent", s], { cwd: ROOT });
    } catch (e) {
      r = { status: null, stdout: "", stderr: `${e.message}\n` };
    }
    process.stdout.write(r.stdout ?? "");
    process.stderr.write(r.stderr ?? "");
    const end = r.status === 0 ? "verified" : r.status === 1 ? "failed" : "unknown";
    if (end !== "verified") console.log(`kaal-testing: suite ${s}: ${end}${r.status === 0 || r.status === 1 ? "" : ` (exit ${r.status ?? "none"})`}`);
    ends.push(end);
  }
  process.exit(ends.includes("failed") ? 1 : ends.includes("unknown") ? 2 : 0);
}
