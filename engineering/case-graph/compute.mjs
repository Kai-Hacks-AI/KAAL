#!/usr/bin/env node
// ARTIST CLI (engineering/case-graph/PLAN.md R1, R7, R9).
//   node engineering/case-graph/compute.mjs --package <dir> [--write | --check]
// Prints the computed Case graph, or writes it to <dir>/04-test/engineering-check/cases.json, or checks that file against a fresh
// computation. Exit 0 ok, 1 --check found the file stale, 2 refused (nothing written). The coverage gaps go to stderr and never
// change the exit code.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { Refusal, compute, render, untraced } from "./graph.mjs";

const args = process.argv.slice(2);
const at = args.indexOf("--package");
const mode = args.includes("--write") ? "write" : args.includes("--check") ? "check" : "print";
if (at < 0 || !args[at + 1] || (args.includes("--write") && args.includes("--check"))) {
  console.error("usage: compute.mjs --package <dir> [--write | --check]");
  process.exit(2);
}
const root = resolve(args[at + 1]);
const target = join(root, "04-test/engineering-check/cases.json");
try {
  const graph = compute(root);
  const text = render(graph);
  const gaps = untraced(root, graph);
  for (const [name, list] of Object.entries(gaps)) if (list.length > 0) console.error(`traceability gap, ${name}: ${list.join(" ")}`);
  if (mode === "write") {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
    console.log(`artist: wrote ${graph.cases.length} Cases (${graph.cases.filter((c) => c.ships).length} ship) to ${target}`);
  } else if (mode === "check") {
    let current = null;
    try {
      current = readFileSync(target, "utf8");
    } catch {
      /* missing counts as stale */
    }
    if (current !== text) {
      console.error(`artist: ${target} is stale or missing; recompute with --write`);
      process.exit(1);
    }
    console.log(`artist: ${target} is current (${graph.cases.length} Cases)`);
  } else process.stdout.write(text);
} catch (error) {
  if (!(error instanceof Refusal)) throw error;
  console.error(`artist: refused: ${error.message}`);
  process.exit(2);
}
