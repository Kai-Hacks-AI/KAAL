// test:consumer (foundation/F8). Runs the delivered tests against the installed copy and prints one
// result on its last line: verified (0), failed (1) or cannot verify (2). Results' meanings are
// Testing's (testing/C9). Zero tests is never verified.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "consumer");
const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".test.mjs")).map((f) => join(dir, f)) : [];
if (!files.length) {
  console.log("cannot verify");
  process.exit(2);
}
// The installed copy must load before it can be exercised: a module of the package that cannot be
// imported is cannot verify, not failed (foundation/F8).
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const modules = Object.values(JSON.parse(readFileSync(join(root, "package.json"), "utf8")).exports ?? {})
  .map((e) => (typeof e === "string" ? e : e?.default))
  .filter((m) => typeof m === "string" && /\.[cm]?js$/.test(m));
for (const m of modules) {
  try {
    await import(pathToFileURL(join(root, m)).href);
  } catch (e) {
    console.log(`${m} cannot be loaded: ${e?.message ?? e}`);
    console.log("cannot verify");
    process.exit(2);
  }
}
// Clear NODE_TEST_CONTEXT, or a run inside node --test reports to the outer runner and counts nothing.
// Pin the TAP reporter: since Node 23 the default reporter is spec even when piped, which has no ok lines.
const r = spawnSync(process.execPath, ["--test", "--test-reporter=tap", ...files], { encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
// node --test reports a file that declares no test as one passing test, so count only declared tests.
const run = new Set(files);
const passed = [...r.stdout.matchAll(/^ok \d+ - (.*)$/gm)].filter((m) => !run.has(m[1].trim())).length;
const result = r.status !== 0 ? "failed" : passed === 0 ? "cannot verify" : "verified";
if (result === "failed") process.stdout.write(r.stdout);
console.log(`${passed} passed`);
console.log(result);
process.exit(result === "verified" ? 0 : result === "failed" ? 1 : 2);
