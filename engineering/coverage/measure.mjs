#!/usr/bin/env node
// Per-capability coverage measurement. Every workspace is a capability, found
// as the Workspaces lane finds it, so a new capability is measured by being a
// workspace. Each capability's own tests run, as its test script defines them,
// under V8 coverage (c8), and only the JavaScript that capability delivers is
// counted: the files npm would pack, including those its tests never load,
// which count as uncovered. Each capability is measured in its own run, so
// coverage of one capability's files by another capability's tests is never
// counted for either.
//
// Coverage is evidence of which delivered code the capability's own tests
// executed. It is not evidence that the code is correct, and no percentage is
// required here. Measured on one host; not measured: TypeScript sources (the
// emitted JavaScript is measured), code reached only through the packed copy
// in engineering/acceptance, and anything a capability does not deliver.
//
// Usage: measure.mjs [workspace ...]   (default: every workspace)
// Writes engineering/out/coverage/<workspace>/coverage-summary.json and
// engineering/out/coverage/summary.json, prints a table, and exits non-zero
// only when a capability's tests fail.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execute, readFile } from "kaal-hosting";

const ROOT = process.cwd();
const OUT = join(ROOT, "engineering", "out", "coverage");
const JS = /\.(m?js|cjs)$/;

function run(command, args) {
  return execute(command, args, { cwd: ROOT });
}

async function npm(args) {
  const r = await run("npm", args);
  if (r.status !== 0) {
    process.stderr.write(r.stdout + r.stderr);
    throw new Error(`npm ${args.join(" ")} exited ${r.status}`);
  }
  return r.stdout;
}

const workspaces = JSON.parse(await npm(["query", ".workspace"])).map(({ name, location }) => ({ name, location }));
const wanted = process.argv.slice(2);
for (const name of wanted) if (!workspaces.some((w) => w.name === name)) throw new Error(`${name} is not a workspace`);

const results = [];
let failed = false;
for (const { name, location } of workspaces.filter((w) => wanted.length === 0 || wanted.includes(w.name))) {
  await npm(["run", "build", "--if-present", "-w", name]);
  const [packed] = JSON.parse(await npm(["pack", "--dry-run", "--json", "--ignore-scripts", "-w", name]));
  const delivered = packed.files.map((f) => `${location}/${f.path}`).filter((p) => JS.test(p)).sort();
  if (delivered.length === 0) {
    const r = await run("npm", ["test", "--if-present", "-w", name]);
    if (r.status !== 0) failed = true;
    results.push({ name, tests: r.status === 0 ? "pass" : "fail", delivered, note: "delivers no JavaScript; nothing to measure" });
    continue;
  }
  const dir = join(OUT, name);
  const args = ["c8", "--all", "--exclude-node-modules=false", "--reporter=json-summary", `--report-dir=${dir}`, `--temp-directory=${join(dir, "tmp")}`, "--clean"];
  for (const p of delivered) args.push(`--include=${p}`);
  const r = await run("npx", [...args, "npm", "test", "--if-present", "-w", name]);
  if (r.status !== 0) {
    failed = true;
    process.stderr.write(r.stdout + r.stderr);
  }
  const summary = JSON.parse((await readFile(join(dir, "coverage-summary.json"))).toString("utf8"));
  const pct = (k) => summary.total[k].pct;
  const unexecuted = Object.entries(summary)
    .filter(([file, s]) => file !== "total" && s.functions.total > 0 && s.functions.covered === 0 && s.lines.covered === 0)
    .map(([file]) => file.slice(ROOT.length + 1).replaceAll("\\", "/"))
    .sort();
  results.push({ name, tests: r.status === 0 ? "pass" : "fail", delivered, lines: pct("lines"), branches: pct("branches"), functions: pct("functions"), unexecuted });
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "summary.json"), JSON.stringify(results, null, 2) + "\n");

const show = (v) => (v === undefined ? "-" : `${v}%`);
console.log("capability | tests | files | lines | branches | functions");
for (const r of results) console.log(`${r.name} | ${r.tests} | ${r.delivered.length} | ${show(r.lines)} | ${show(r.branches)} | ${show(r.functions)}${r.note ? ` | ${r.note}` : ""}`);
for (const r of results) for (const f of r.unexecuted ?? []) console.log(`${r.name}: ${f} is delivered but not executed by its own tests`);
if (failed) process.exitCode = 1;
