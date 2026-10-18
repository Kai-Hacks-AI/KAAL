#!/usr/bin/env node
// The repository's non-blank text lines, attributed to the Capabilities,
// Agents, Skills and Extensions that claim them. Lists every file Git tracks,
// reads each through Hosting, and has Testing count them
// (kaal-testing/inventory) and attribute them (kaal-testing/attribution) by the
// ownership files among them. Which CASE Nodes exist is Core's answer: the
// tracked files are admitted with Core's evaluate, and a claim resolves only to
// a Node Core types by one of its four foundational CASE kinds. Graph finds the
// admitted Nodes of each kind.
//
// Usage: attribute.mjs [--json]
// Prints each owner's kind, files and lines, the unassigned and conflicting
// files, every finding, and the accounting, or with --json the whole
// attribution as JSON. Exits non-zero when the files cannot be listed or read.
// Findings do not change the exit status: they are reported, not gated.
// Nothing here writes a file.
import { join } from "node:path";
import { evaluate, foundation } from "kaal-core";
import { Graph } from "kaal-graph";
import { execute, readFile } from "kaal-hosting";
import { attribute, isClaimFile, KINDS } from "kaal-testing/attribution";
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

const engine = evaluate(Object.fromEntries(files.map(({ path, bytes }) => [path, bytes])));
const admitted = new Graph(engine.nodes);
const owners = KINDS.flatMap((kind) => admitted.typed(foundation()[kind]).map(({ name, id }) => ({ kind, name, id })));
const result = attribute(inventory(files), files.filter(({ path }) => isClaimFile(path)), owners);

if (json) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.log("owner | files | non-blank text lines");
for (const c of result.owners) console.log(`${c.kind} ${c.name} (${c.id.slice(0, 12)}) | ${c.files} | ${c.lines}`);
console.log(`unassigned | ${result.unassigned.files} | ${result.unassigned.lines}`);
console.log(`  of which conflicting claims | ${result.conflicts.files} | ${result.conflicts.lines}`);
console.log(`total | ${result.owners.reduce((n, c) => n + c.files, 0) + result.unassigned.files} | ${result.lines}`);
for (const e of result.conflicts.entries) console.log(`conflict: ${e.path} is claimed by ${e.claimants.map((c) => c.name).join(" and ")}`);
for (const f of result.findings) console.log(`${f.kind}: ${f.subject}: ${f.evidence}`);
console.log(
  `accounting: ${result.lines} repository lines = ${result.owners.map((c) => `${c.lines} ${c.name}`).join(" + ") || "0 attributed"} + ${result.unassigned.lines} unassigned; ${KINDS.map((k) => `${owners.filter((o) => o.kind === k).length} ${k}`).join(", ")} Nodes admitted; files are attributed only by their owner's own claim, never by package or directory`,
);
