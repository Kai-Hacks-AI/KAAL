#!/usr/bin/env node
// The repository's non-blank text lines, attributed to the capabilities that
// claim them. Lists every file Git tracks, reads each through Hosting, and has
// Testing count them (kaal-testing/inventory) and attribute them
// (kaal-testing/attribution) by the ownership files among them. Which
// Capability Nodes exist is Core's answer: the tracked files are admitted with
// Core's evaluate, and a claim resolves only to a Node Core types by its
// foundational KAAL Capability.
//
// Usage: attribute.mjs [--json]
// Prints each capability's files and lines, the unassigned and conflicting
// files, every finding, and the accounting, or with --json the whole
// attribution as JSON. Exits non-zero when the files cannot be listed or read.
// Findings do not change the exit status: they are reported, not gated.
// Nothing here writes a file.
import { join } from "node:path";
import { evaluate, foundation } from "kaal-core";
import { execute, readFile } from "kaal-hosting";
import { attribute, isClaimFile } from "kaal-testing/attribution";
import { inventory } from "kaal-testing/inventory";

const ROOT = process.cwd();
const json = process.argv.includes("--json");

const listed = await execute("git", ["ls-files", "-z", "--full-name"], { cwd: ROOT });
if (listed.status !== 0) {
  console.error(`attribution: listing the tracked files failed (git ls-files exited ${listed.status})\n${listed.stderr}`);
  process.exit(1);
}
const files = [];
for (const path of listed.stdout.split("\0").filter(Boolean)) {
  try {
    files.push({ path, bytes: await readFile(join(ROOT, path)) });
  } catch (e) {
    console.error(`attribution: ${path} is tracked but could not be read (${e.code ?? e.message})`);
    process.exit(1);
  }
}

const capabilities = evaluate(Object.fromEntries(files.map(({ path, bytes }) => [path, bytes])))
  .typedBy(foundation().capability)
  .map(({ name, id }) => ({ name, id }));
const result = attribute(inventory(files), files.filter(({ path }) => isClaimFile(path)), capabilities);

if (json) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.log("capability | files | non-blank text lines");
for (const c of result.capabilities) console.log(`${c.name} (${c.id.slice(0, 12)}) | ${c.files} | ${c.lines}`);
console.log(`unassigned | ${result.unassigned.files} | ${result.unassigned.lines}`);
console.log(`  of which conflicting claims | ${result.conflicts.files} | ${result.conflicts.lines}`);
console.log(`total | ${result.capabilities.reduce((n, c) => n + c.files, 0) + result.unassigned.files} | ${result.lines}`);
for (const e of result.conflicts.entries) console.log(`conflict: ${e.path} is claimed by ${e.claimants.map((c) => c.name).join(" and ")}`);
for (const f of result.findings) console.log(`${f.kind}: ${f.subject}: ${f.evidence}`);
console.log(
  `accounting: ${result.lines} repository lines = ${result.capabilities.map((c) => `${c.lines} ${c.name}`).join(" + ") || "0 attributed"} + ${result.unassigned.lines} unassigned; ${capabilities.length} admitted Capability Nodes; files are attributed only by their capability's own claim, never by package or directory`,
);
