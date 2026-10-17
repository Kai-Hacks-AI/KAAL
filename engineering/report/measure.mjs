#!/usr/bin/env node
// The Testing report: package coverage and CASE ownership, side by side and
// reconciled where the evidence links them. Runs Engineering's two measurement
// drivers on this tree as they run on their own, coverage/measure.mjs and
// inventory/attribute.mjs, each with --json and through Hosting, and has Testing
// reconcile their results (kaal-testing/report). Neither driver is changed or
// duplicated here.
//
// Usage: measure.mjs [--json]
// Prints the ownership dimension, the package dimension, the reconciliation
// and every finding, or with --json the whole report as JSON. Exits non-zero
// when either driver produces no result, or when coverage reports a failed
// measurement or failing tests, as coverage/measure.mjs does. Other findings do
// not change the exit status: they are reported, not gated. Nothing here
// writes a file.
import { join } from "node:path";
import { execute } from "kaal-hosting";
import { report } from "kaal-testing/report";

const ROOT = process.cwd();
const json = process.argv.includes("--json");

/** Run an Engineering driver with --json; its parsed result, or exit naming it. */
async function driver(path) {
  const r = await execute(process.execPath, [join(ROOT, "engineering", path), "--json"], { cwd: ROOT });
  process.stderr.write(r.stderr);
  try {
    return { result: JSON.parse(r.stdout), status: r.status };
  } catch {
    console.error(`report: ${path} produced no JSON result (exited ${r.status})`);
    process.exit(1);
  }
}

const attribution = await driver("inventory/attribute.mjs");
if (attribution.status !== 0) {
  console.error(`report: inventory/attribute.mjs exited ${attribution.status}`);
  process.exit(1);
}
const coverage = await driver("coverage/measure.mjs");
const result = report(attribution.result, coverage.result);

if (json) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(coverage.status === 0 ? 0 : 1);
}

const { ownership, packages, reconciliation } = result;
const executable = ({ executed, total, unmeasured }) => `${executed} of ${total}${unmeasured ? ` (${unmeasured} files not measured)` : ""}`;
const pct = (v) => (v === undefined ? "-" : `${v}%`);

console.log(`ownership: ${ownership.metric}`);
console.log("owner | files | non-blank text lines");
for (const o of ownership.owners) console.log(`${o.kind} ${o.name} (${o.id.slice(0, 12)}) | ${o.files} | ${o.nonBlankLines}`);
console.log(`unassigned | ${ownership.unassigned.files} | ${ownership.unassigned.nonBlankLines}`);
console.log(`  of which conflicting claims | ${ownership.conflicts.files} | ${ownership.conflicts.nonBlankLines}`);
console.log(`total | | ${ownership.nonBlankLines}`);
console.log("");
console.log("packages: delivered JavaScript, executed by the workspace's own tests");
console.log("workspace | tests | delivered JS files | lines | branches | functions");
for (const p of packages) {
  const figures = p.failed ? "not measured | - | -" : p.note ? "N/A | N/A | N/A" : `${pct(p.lines)} | ${pct(p.branches)} | ${pct(p.functions)}`;
  console.log(`${p.workspace} | ${p.tests ?? "-"} | ${p.deliveredFiles} | ${figures}${p.note ? ` | ${p.note}` : ""}`);
}
console.log("");
console.log(`reconciliation: ${reconciliation.metric}`);
console.log("owner | delivered files | executable lines executed");
for (const o of reconciliation.owners) console.log(`${o.kind} ${o.name} (${o.id.slice(0, 12)}) | ${o.deliveredFiles} | ${executable(o.executableLines)}`);
console.log("status | delivered files | executable lines executed");
for (const s of reconciliation.statuses) console.log(`${s.status} | ${s.deliveredFiles} | ${executable(s.executableLines)}`);
for (const e of reconciliation.entries.filter((e) => e.status !== "attributed")) console.log(`not reconciled: ${e.workspace}: ${e.path}: ${e.status}`);
console.log("");
for (const f of result.findings) console.log(`${f.kind}: ${f.subject}: ${f.evidence}`);
console.log(
  "scope: ownership counts non-blank text lines of tracked files by their owners' own claims; packages count executable lines of delivered JavaScript run by each workspace's own tests; a delivered file joins an owner only by its exact tracked path; the two metrics are never combined",
);
if (coverage.status !== 0) process.exitCode = 1;
