#!/usr/bin/env node
// Lists the open Handover records in a directory, judged against an Engine.
// Usage: open-handovers.mjs <records-dir> [--engine <dir>]
// Exits 0 when every record is sound, 1 when any record has a problem, 2 on misuse.
import { statSync } from "node:fs";
import { resolve } from "node:path";
import { read } from "kaal-hosting";
import { judge } from "./handovers.mjs";

const USAGE = "usage: open-handovers.mjs <records-dir> [--engine <dir>]";
const args = process.argv.slice(2);
let engine = resolve(".kaal");
const at = args.indexOf("--engine");
if (at >= 0) {
  if (!args[at + 1]) (console.error(USAGE), process.exit(2));
  engine = resolve(args[at + 1]);
  args.splice(at, 2);
}
if (args.length !== 1 || args[0].startsWith("--")) (console.error(USAGE), process.exit(2));

// Hosting reads a missing directory as empty; here that would hide every pending Handover.
for (const dir of [engine, resolve(args[0])]) {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) (console.error(`${dir} is not a directory`), process.exit(2));
}

let result;
try {
  result = judge(await read(engine), await read(resolve(args[0])));
} catch (e) {
  console.error(e.message);
  process.exit(2);
}
for (const r of result.open) {
  console.log(`open\t${r.id}\t${r.name}\t${r.from.split("\n")[0]} -> ${r.to.split("\n")[0]}`);
}
for (const r of result.answered) console.log(`answered\t${r.id}\t${r.name}`);
for (const p of result.problems) console.error(p);
// Let the output drain: process.exit could cut off what is still buffered.
process.exitCode = result.problems.length ? 1 : 0;
