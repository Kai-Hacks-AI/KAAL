#!/usr/bin/env node
// Guard External (A10): KAAL Engineering delivers Guard naked into a target repository as one Change, a
// branch with one commit, from the target's own commands. The Change is a handful of plain files the
// target owns (N5): a runner script, the pre-push hook, a CI workflow and a page of docs. It adds no
// package and no KAAL element, and it never overwrites a file the target already has (F8).
//
//   node engineering/guard/external/deliver.mjs --target <repo> --checks <checks.json> --branch <name>
//
// checks.json names the target's own checks: { "<name>": { "command": "<command>", "runs": ["local", "ci"] } }.
// A command is the target's own, as it would type it in sh; Guard does not interpret it.
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TEMPLATES = join(dirname(fileURLToPath(import.meta.url)), "templates");
const RUNNER = ".githooks/guard.sh";
const HOOK = ".githooks/pre-push";
const WORKFLOW = ".github/workflows/guard.yml";
const DOCS = "GUARD.md";
const HOOK_LINE = `sh ${RUNNER} pre-push "$@" || exit 1`;

/** Stops the delivery: nothing has been written. */
function stop(message, todo) {
  console.error(`cannot deliver: ${message}`);
  if (todo) console.error(`  do: ${todo}`);
  process.exit(2);
}

function options(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    const [key, value] = [argv[i], argv[i + 1]];
    if (!["--target", "--checks", "--branch"].includes(key) || value === undefined) {
      stop(`unknown or incomplete option ${key}`, "use --target <repo> --checks <checks.json> --branch <name>");
    }
    out[key.slice(2)] = value;
  }
  for (const k of ["target", "checks", "branch"]) if (!out[k]) stop(`--${k} is missing`, "use --target <repo> --checks <checks.json> --branch <name>");
  return out;
}

/** The target's checks, validated: names safe as sh case patterns and YAML words, one-line commands. */
function readChecks(path) {
  let checks;
  try {
    checks = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    stop(`${path} cannot be read: ${e.message}`);
  }
  if (!checks || typeof checks !== "object" || Array.isArray(checks) || !Object.keys(checks).length) stop(`${path} names no checks`);
  for (const [name, c] of Object.entries(checks)) {
    if (!/^[A-Za-z0-9._-]+$/.test(name)) stop(`check name "${name}" is not a plain word`, "use letters, digits, dot, dash or underscore");
    if (typeof c?.command !== "string" || !c.command.trim() || /[\r\n]/.test(c.command)) stop(`${name} has no one-line command`);
    if (!Array.isArray(c.runs) || !c.runs.length || !c.runs.every((r) => r === "local" || r === "ci")) stop(`${name}: runs must list local, ci or both`);
  }
  return checks;
}

const template = (name) => readFileSync(join(TEMPLATES, name), "utf8").replace(/\r\n/g, "\n");

/** Each delivered file's content, from the templates and the target's checks. */
export function render(checks, target) {
  const names = (where) => Object.keys(checks).filter((n) => checks[n].runs.includes(where));
  const ci = names("ci");
  const runner = template("guard.sh")
    .replace("@LOCAL@", names("local").join(" "))
    .replace("@CI@", ci.join(" "))
    .replace("@CASES@", Object.entries(checks).map(([n, c]) => `    ${n}) ${c.command.trim()} ;;`).join("\n"));
  // Set up what the target's own commands need: Node when it has a package.json, its locked dependencies when it has a lockfile.
  const setup = [];
  if (existsSync(join(target, "package.json"))) {
    setup.push("      - uses: actions/setup-node@v4", "        with:", "          node-version: lts/*");
    if (existsSync(join(target, "package-lock.json"))) setup.push("      - run: npm ci");
  }
  const workflow = template("guard.yml")
    .replace("@MATRIX@", ci.map((n) => `          - { check: ${n} }`).join("\n"))
    .replace("@SETUP@\n", setup.length ? `${setup.join("\n")}\n` : "");
  const listed = Object.entries(checks).map(([n, c]) => `- \`${n}\`: \`${c.command.trim()}\`, runs ${c.runs.map((r) => (r === "local" ? "in the hook" : "in CI")).join(" and ")}`);
  const docs = template("GUARD.md").replace("@CHECKS@", listed.join("\n"));
  const files = { [RUNNER]: runner, [HOOK]: template("pre-push"), [DOCS]: docs };
  if (ci.length) files[WORKFLOW] = workflow;
  return files;
}

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { status: r.status, out: (r.stdout ?? "").trim(), err: (r.stderr ?? "").trim() };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { target: given, checks: checksPath, branch } = options(process.argv.slice(2));
  const target = git(resolve(given), "rev-parse", "--show-toplevel").out;
  if (!target) stop(`${given} is not a Git working tree`);
  if (git(target, "status", "--porcelain").out) stop(`${target} has uncommitted changes`, "commit or stash them, then deliver again");
  if (git(target, "rev-parse", "--verify", "--quiet", `refs/heads/${branch}`).status === 0) stop(`branch ${branch} exists in the target`, "name a new branch");
  const checks = readChecks(checksPath);
  if (existsSync(join(target, RUNNER))) stop(`${RUNNER} exists in the target`, "Guard's runner would overwrite it; deliver by hand or rename it");

  const kept = [];
  const files = render(checks, target);
  for (const path of Object.keys(files)) {
    if (path !== RUNNER && existsSync(join(target, path))) {
      kept.push(path);
      delete files[path];
    }
  }
  const from = git(target, "rev-parse", "--abbrev-ref", "HEAD").out;
  if (git(target, "checkout", "-q", "-b", branch).status !== 0) stop(`branch ${branch} cannot be created`);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(target, path)), { recursive: true });
    writeFileSync(join(target, path), text);
    if (path.startsWith(".githooks/")) chmodSync(join(target, path), 0o755);
  }
  git(target, "add", "--", ...Object.keys(files));
  const commit = git(target, "commit", "-q", "-m", "Add Guard: run this repository's checks in a pre-push hook and in CI, with one meaning", "-m", "See GUARD.md.");
  git(target, "checkout", "-q", from);
  if (commit.status !== 0) stop(`the commit failed: ${commit.err}`);

  console.log(`delivered on branch ${branch}, one commit: ${Object.keys(files).join(", ")}`);
  for (const path of kept) {
    console.log(`kept ${path}, which the target already has.`);
    if (path === HOOK) console.log(`  To run Guard's local checks from it, add: ${HOOK_LINE}`);
    else if (path === WORKFLOW) console.log(`  Give a job the step "- run: sh ${RUNNER} --check <name>" for each CI check.`);
  }
  console.log("Next: push the branch and open the pull request. After merging, each clone enables the hook with git config core.hooksPath .githooks, and the repository makes the Guard jobs required checks if a merge should depend on them.");
}
