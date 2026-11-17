#!/usr/bin/env node
// kaal-agents: `orient` (NEW) and `preach check` (PREACH). Errors name their cause and print no
// stack trace (agents/F3).
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { orient, render } from "../lib/orient.mjs";
import { check } from "../lib/preach.mjs";

const USAGE = "usage: kaal-agents orient [<dir>] [--json] | kaal-agents preach check <report.json>";

function fail(message, status = 1) {
  process.stderr.write(`kaal-agents: ${message}\n`);
  process.exit(status);
}

async function orientCommand(args) {
  const json = args.includes("--json");
  const rest = args.filter((a) => a !== "--json");
  if (rest.length > 1 || rest.some((a) => a.startsWith("-"))) fail(USAGE);
  const dir = resolve(rest[0] ?? ".");
  let directory = false;
  try {
    directory = statSync(dir).isDirectory();
  } catch {
    // reported below
  }
  if (!directory) fail(`${dir} is not a directory`);
  const report = await orient(dir);
  process.stdout.write(json ? `${JSON.stringify(report, null, 2)}\n` : render(report));
  process.exitCode = report.unresolved.length ? 2 : 0;
}

function preachCommand(args) {
  if (args[0] !== "check" || args.length !== 2) fail(USAGE);
  let report;
  try {
    report = JSON.parse(readFileSync(args[1], "utf8"));
  } catch (e) {
    fail(`${args[1]} cannot be read as JSON: ${e.message}`, 2);
  }
  const { problems, line } = check(report);
  if (problems.length) {
    process.stderr.write(`PREACH report structurally invalid:\n${problems.map((p) => `- ${p}`).join("\n")}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`${line}\n`);
}

const [command, ...args] = process.argv.slice(2);
try {
  if (command === "orient") await orientCommand(args);
  else if (command === "preach") preachCommand(args);
  else fail(USAGE);
} catch (e) {
  fail(e.message);
}
