#!/usr/bin/env node
// Executable-code coverage of npm workspaces. For each workspace, found with
// `npm query .workspace` as the Workspaces lane finds it, the workspace's own
// tests run, as its test script defines them, under V8 coverage (c8). Only the
// JavaScript the workspace delivers is counted: the files `npm pack` would
// include, including those its tests never load, which count as unexecuted.
// Each workspace is measured in its own run, so one workspace's tests never add
// to another's figures.
//
// Scope. This measures workspace-delivered JavaScript exercised by that
// workspace's own tests, on one host. It is not per-capability coverage: npm
// workspaces are not the set of KAAL capabilities. Outside it are capabilities
// that are not packaged as workspaces, repository code outside workspaces,
// TypeScript sources (the emitted JavaScript is measured), and execution by
// acceptance or by other workspaces' tests. Coverage is evidence of executed
// code, not of correctness, and no percentage is required here.
//
// Usage: measure.mjs [workspace ...]   (default: every workspace)
// Writes engineering/out/coverage/<workspace>/coverage-summary.json and
// engineering/out/coverage/summary.json, prints a table, and exits non-zero
// when a workspace's tests fail or its coverage cannot be measured, naming the
// workspace and what is missing.
//
// This script answers the packaging questions (which workspaces, built, which
// files each delivers); execute.mjs runs the tests and measures the evidence.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execute } from "kaal-hosting";
import { cover } from "./execute.mjs";

const ROOT = process.cwd();
const OUT = join(ROOT, "engineering", "out", "coverage");
const JS = /\.(m?js|cjs)$/;

function run(command, args) {
  return execute(command, args, { cwd: ROOT });
}

/** Run npm; on failure, the reason, naming `what`, and the output to show. */
async function npm(args, what) {
  const r = await run("npm", args);
  if (r.status !== 0) return { failed: `${what} failed (npm ${args.join(" ")} exited ${r.status})`, output: r.stdout + r.stderr };
  return { stdout: r.stdout };
}

const listed = await npm(["query", ".workspace"], "listing the workspaces");
if (listed.failed) {
  process.stderr.write(listed.output);
  console.error(listed.failed);
  process.exit(1);
}
const workspaces = JSON.parse(listed.stdout).map(({ name, location }) => ({ name, location }));
const wanted = process.argv.slice(2);
const unknown = wanted.filter((name) => !workspaces.some((w) => w.name === name));
if (unknown.length) {
  console.error(`not a workspace: ${unknown.join(", ")}`);
  process.exit(2);
}

async function measure(name, location) {
  const built = await npm(["run", "build", "--if-present", "-w", name], `${name}: building`);
  if (built.failed) return built;
  const pack = await npm(["pack", "--dry-run", "--json", "--ignore-scripts", "-w", name], `${name}: listing the delivered files`);
  if (pack.failed) return pack;
  const delivered = JSON.parse(pack.stdout)[0].files.map((f) => `${location}/${f.path}`).filter((p) => JS.test(p)).sort();
  if (delivered.length === 0) {
    const r = await run("npm", ["test", "--if-present", "-w", name]);
    return { tests: r.status === 0 ? "pass" : "fail", delivered, note: "delivers no JavaScript; nothing to measure", output: r.status === 0 ? "" : r.stdout + r.stderr };
  }
  return { delivered, ...(await cover(name, delivered, { root: ROOT, dir: join(OUT, name) })) };
}

const results = [];
for (const { name, location } of workspaces.filter((w) => wanted.length === 0 || wanted.includes(w.name))) {
  const { output, ...result } = await measure(name, location);
  if (output) process.stderr.write(output);
  results.push({ workspace: name, ...result });
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "summary.json"), JSON.stringify(results, null, 2) + "\n");

const show = (v) => (v === undefined ? "-" : `${v}%`);
console.log("workspace | tests | delivered JS files | lines | branches | functions");
for (const r of results) {
  const figures = r.failed ? "not measured | - | -" : r.note ? "N/A | N/A | N/A" : `${show(r.lines)} | ${show(r.branches)} | ${show(r.functions)}`;
  console.log(`${r.workspace} | ${r.tests ?? "-"} | ${r.delivered?.length ?? "-"} | ${figures}${r.note ? ` | ${r.note}` : ""}`);
}
for (const r of results) for (const f of r.unexecuted ?? []) console.log(`${r.workspace}: ${f} is delivered but not executed by its own tests`);
for (const r of results) if (r.failed) console.error(`failed: ${r.failed}`);
for (const r of results) if (r.tests === "fail") console.error(`failed: ${r.workspace}: its tests failed`);
console.log("scope: delivered JavaScript of each npm workspace, executed by that workspace's own tests, on this host; not per-capability coverage");
if (results.some((r) => r.failed || r.tests === "fail")) process.exitCode = 1;
