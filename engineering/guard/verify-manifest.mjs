// Writes kaal-guard's shipped verification manifest, packages/kaal-guard/test/verify.json (guard/A18):
// the inventory of the delivered outer acceptance cases, as a run of them names them, and the SHA-256
// of every file npm packs except the manifest itself. First it writes the trace in the product's
// docs/testing.md from the cases' titles (guard/A19), so the trace never drifts from the cases. Run it after any Change to a shipped file, from
// the repository root: node engineering/guard/verify-manifest.mjs. guard/T101 is cannot verify until
// the manifest matches the package.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execute, files, MANIFEST, PACKAGE } from "../../packages/kaal-guard/test/verify.mjs";

const WINDOWS = process.platform === "win32";

delete process.env.NODE_TEST_CONTEXT;

const pack = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE, encoding: "utf8", shell: WINDOWS, maxBuffer: 64 * 1024 * 1024 });
if (pack.status !== 0) throw new Error(`npm pack --dry-run failed: ${pack.stderr}`);
const shipped = JSON.parse(pack.stdout)[0].files.map((f) => f.path).filter((f) => f !== MANIFEST).sort();
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const caseFiles = files(join(PACKAGE, "test", "acceptance")).filter((f) => f.endsWith(".test.mjs")).map((f) => join(PACKAGE, "test", "acceptance", f));

// The trace: one row per delivered case, from its title "guard/T<n> [<ids>]: <what it checks>".
const LOOP = { "intent.test.mjs": "Intent", "requirements.test.mjs": "Requirements", "architecture.test.mjs": "Architecture" };
const rows = caseFiles.flatMap((file) => {
  const loop = LOOP[file.split(/[\\/]/).pop()];
  if (!loop) throw new Error(`no loop is named for ${file}`);
  return [...readFileSync(file, "utf8").matchAll(/\b(?:it|test)\(\s*"(guard\/T(\d+)) \[([^\]]*)\]: ([^"]*)"/g)]
    .map((m) => ({ id: m[1], n: Number(m[2]), row: `| ${m[1]} | ${loop} | ${m[3]} | ${m[4].replaceAll("|", "\\|")} |` }));
}).sort((a, b) => a.n - b.n);
const TESTING = join(PACKAGE, "docs", "testing.md");
const [BEGIN, END] = ["<!-- trace: written by the publisher from the cases' titles -->", "<!-- end of trace -->"];
const testing = readFileSync(TESTING, "utf8");
if (!testing.includes(BEGIN) || !testing.includes(END)) throw new Error(`${TESTING} has no trace markers`);
const trace = ["| Case | Loop | Checks | What it checks |", "| --- | --- | --- | --- |", ...rows.map((r) => r.row)].join("\n");
writeFileSync(TESTING, `${testing.slice(0, testing.indexOf(BEGIN) + BEGIN.length)}\n${trace}\n${testing.slice(testing.indexOf(END))}`);
const outcomes = await execute(caseFiles);
const failed = outcomes.filter((o) => o.status !== "passed");
if (failed.length) throw new Error(`the delivered cases must all pass before their inventory is written: ${failed.map((o) => `${o.status}: ${o.name}`).join("; ")}`);

const manifest = {
  cases: outcomes.map((o) => o.name).sort(),
  files: Object.fromEntries(shipped.map((f) => [f, sha256(readFileSync(join(PACKAGE, f)))])),
};
writeFileSync(join(PACKAGE, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${MANIFEST}: ${manifest.cases.length} cases, ${shipped.length} files`);
