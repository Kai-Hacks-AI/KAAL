#!/usr/bin/env node
// kaal-guard: runs a repository's own checks for its Git hook and its CI, with one meaning per check.
import { resolve } from "node:path";
import { configDir, legacy, readDeclarations, Refusal, shown } from "../lib/config.mjs";
import { annotations, declarations, summarize, verify } from "../lib/github.mjs";
import { init, remove, upgrade } from "../lib/lifecycle.mjs";
import { line as reminderLine, needed, skill } from "../lib/reminder.mjs";
import { FACTS, lines, run, status } from "../lib/runner.mjs";
import { checkout, gitRoot, readRecord, readState } from "../lib/state.mjs";

const USAGE = `usage: kaal-guard run (--hook | --ci | --check <name>) [--config <dir>] [--github]
                       [--head <commit>] [--base <commit>] [--base-ref <name>] [--changed <file>]
       kaal-guard verify [--config <dir>] [--github]
       kaal-guard (init | remove) [--hook] [--ci] [--config <dir>]
       kaal-guard upgrade [--config <dir>]`;

/** Prints a cannot-judge verdict about kaal-guard itself and exits 2. */
function cannotJudge(evidence, todo) {
  console.log(`cannot judge: kaal-guard: ${evidence}`);
  console.log(`  do: ${todo}`);
  process.exit(2);
}

/** The options a command accepts: flags it takes alone, and options that take a value. */
function parse(args, flags, valued) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (flags.includes(a)) options[a] = true;
    else if (valued.includes(a)) {
      const value = args[++i];
      if (value === undefined || value.startsWith("--")) cannotJudge(`${a} needs a value`, USAGE);
      options[a] = value;
    } else cannotJudge(`unknown option ${a}`, USAGE);
  }
  return options;
}

/**
 * Everything a command stands on, read and validated before it runs or writes anything: the repository's
 * top level, its declarations, the installation record and the checkout state. Any of them outside its
 * contract is cannot judge, and nothing is run or written. Declarations are required unless `optional`.
 */
function load(option, { optional = false } = {}) {
  const cwd = process.cwd();
  const root = gitRoot(cwd);
  if (!root) cannotJudge("this is not inside a Git working tree", "run kaal-guard inside the repository");
  try {
    const old = legacy(root);
    if (old) throw old;
    const dir = configDir(root, cwd, option);
    const read = readDeclarations(root, dir);
    if (read.absent && !optional) {
      throw new Refusal(`there is no configuration: ${shown(root, dir)}/ does not exist`, option === undefined ? "run kaal-guard init, then declare each check there as <name>.md" : "name an existing directory with --config, or run kaal-guard init");
    }
    const at = checkout(root);
    return { root, dir, list: read.list ?? { checks: {} }, record: readRecord(root), at, state: readState(at) };
  } catch (e) {
    if (e instanceof Refusal) cannotJudge(e.message, e.todo);
    throw e;
  }
}

/**
 * Prints the results' verdict lines, and with --github their annotations and summary, then exits with
 * the run's status. A run that has a fail or cannot judge also names where the kaal-guard Skill is, as
 * one line after the verdict lines, in its error annotations and in its summary (F21); `remind` gives
 * the repository's root and record for that, and only `run` gives it.
 */
function report(results, github, remind) {
  const where = remind && needed(results) ? skill(remind.root, remind.record) : undefined;
  for (const line of lines(results)) console.log(line);
  if (where) console.log(reminderLine(where));
  if (github) {
    for (const line of annotations(results, where?.path)) console.log(line);
    summarize(results, process.env.GITHUB_STEP_SUMMARY, where && reminderLine(where));
  }
  process.exit(status(results));
}

const [command, ...args] = process.argv.slice(2);
const LIFECYCLE = { init, upgrade, remove };
if (command in LIFECYCLE) {
  const options = parse(args, command === "upgrade" ? [] : ["--hook", "--ci"], ["--config"]);
  const context = load(options["--config"], { optional: true });
  let result;
  try {
    result = LIFECYCLE[command](context.root, { ...context, declared: declarations(context.root), hook: Boolean(options["--hook"]), ci: Boolean(options["--ci"]) });
  } catch (e) {
    cannotJudge(e.message, "reinstall the package, then run the command again");
  }
  for (const line of result.lines) console.log(line);
  process.exit(0);
}
if (command === "verify") {
  const options = parse(args, ["--github"], ["--config"]);
  const { root, list } = load(options["--config"]);
  const { results } = verify(root, list);
  if (results.length === 0) console.log("kaal-guard: no ci checks are declared");
  report(results, options["--github"]);
}
if (command !== "run") cannotJudge(command ? `${command} is not a kaal-guard command in this version` : "no command", USAGE);

const byOption = Object.fromEntries(Object.entries(FACTS).map(([fact, { option }]) => [option, fact]));
if (args.includes("--local")) cannotJudge("--local is not an option of run in this version; did you mean --hook? A check the Git hook runs is registered as runs: [hook]", USAGE);
const options = parse(args, ["--hook", "--ci", "--github"], ["--check", "--config", ...Object.keys(byOption)]);
const selection = {};
if (options["--hook"]) selection.hook = true;
if (options["--ci"]) selection.ci = true;
if (options["--check"] !== undefined) selection.check = options["--check"];
if (Object.keys(selection).length !== 1) cannotJudge("run needs exactly one of --hook, --ci or --check <name>", USAGE);
const facts = {};
for (const [option, fact] of Object.entries(byOption)) if (options[option] !== undefined) facts[fact] = fact === "changed" ? resolve(options[option]) : options[option];
const { root, list, record } = load(options["--config"]);
const { results } = run(root, list, selection, facts);
if (results.length === 0) console.log(`kaal-guard: no checks run ${selection.hook ? "--hook" : "--ci"}`);
report(results, options["--github"], { root, record });
