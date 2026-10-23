#!/usr/bin/env node
// kaal-guard: runs a repository's own checks for its Git hook and its CI, with one meaning per check.
import { resolve } from "node:path";
import { annotations, summarize, verify } from "../lib/github.mjs";
import { gitRoot, init, remove, upgrade } from "../lib/lifecycle.mjs";
import { FACTS, findRoot, lines, readList, run, status } from "../lib/runner.mjs";

const USAGE = `usage: kaal-guard run (--local | --ci | --check <name>) [--github]
                       [--head <commit>] [--base <commit>] [--base-ref <name>] [--changed <file>]
       kaal-guard verify [--github]
       kaal-guard (init | upgrade | remove)`;

/** Prints a cannot-judge verdict about kaal-guard itself and exits 2. */
function cannotJudge(evidence, todo) {
  console.log(`cannot judge: kaal-guard: ${evidence}`);
  console.log(`  do: ${todo}`);
  process.exit(2);
}

function parseRun(args) {
  const options = { selection: {}, facts: {}, github: false };
  const byOption = Object.fromEntries(Object.entries(FACTS).map(([fact, { option }]) => [option, fact]));
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--local" || a === "--ci") options.selection[a.slice(2)] = true;
    else if (a === "--github") options.github = true;
    else if (a === "--check" || a in byOption) {
      const value = args[++i];
      if (value === undefined || value.startsWith("--")) cannotJudge(`${a} needs a value`, USAGE);
      if (a === "--check") options.selection.check = value;
      else options.facts[byOption[a]] = byOption[a] === "changed" ? resolve(value) : value;
    } else cannotJudge(`unknown option ${a}`, USAGE);
  }
  if (Object.keys(options.selection).length !== 1) cannotJudge("run needs exactly one of --local, --ci or --check <name>", USAGE);
  return options;
}

/** Prints the results' verdict lines, and with --github their annotations and summary, then exits with the run's status. */
function report(results, github) {
  for (const line of lines(results)) console.log(line);
  if (github) {
    for (const line of annotations(results)) console.log(line);
    summarize(results, process.env.GITHUB_STEP_SUMMARY);
  }
  process.exit(status(results));
}

const [command, ...args] = process.argv.slice(2);
const LIFECYCLE = { init, upgrade, remove };
if (command in LIFECYCLE) {
  if (args.length) cannotJudge(`unknown option ${args[0]}`, USAGE);
  const root = gitRoot(process.cwd());
  if (!root) cannotJudge(`${command} needs a Git working tree`, "run it inside the repository");
  const { lines, problem } = LIFECYCLE[command](root);
  if (problem) cannotJudge(problem, "correct guard.json");
  for (const line of lines) console.log(line);
  process.exit(0);
}
if (command === "verify") {
  const unknown = args.find((a) => a !== "--github");
  if (unknown) cannotJudge(`unknown option ${unknown}`, USAGE);
  const root = findRoot(process.cwd());
  if (!root) cannotJudge("there is no guard.json here or in any parent directory", "add guard.json at the repository root");
  const { list, problem } = readList(root);
  if (problem) cannotJudge(problem, "correct guard.json");
  const { results } = verify(root, list);
  if (results.length === 0) console.log("kaal-guard: guard.json lists no ci checks");
  report(results, args.includes("--github"));
}
if (command !== "run") cannotJudge(command ? `${command} is not a kaal-guard command in this version` : "no command", USAGE);

const { selection, facts, github } = parseRun(args);
const root = findRoot(process.cwd());
if (!root) cannotJudge("there is no guard.json here or in any parent directory", "add guard.json at the repository root");
const outcome = run(root, selection, facts);
if (outcome.problem) cannotJudge(outcome.problem, "correct guard.json");
const { results } = outcome;
if (results.length === 0) console.log(`kaal-guard: no checks run ${selection.local ? "--local" : "--ci"}`);
report(results, github);
