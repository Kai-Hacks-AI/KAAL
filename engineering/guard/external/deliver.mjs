#!/usr/bin/env node
// Guard External (A10): KAAL Engineering delivers Guard naked into a target repository as one Change, a
// branch with one commit, from the target's own commands. The Change is a handful of plain files the
// target owns (N5): a runner script, the pre-push hook, a CI workflow, a page of docs and Guard's Skill
// at its canonical location (guard/F25). It adds no package and no KAAL element, and it never
// overwrites a file the target already has (F8).
//
//   node engineering/guard/external/deliver.mjs --target <repo> --checks <checks.json> --branch <name> [--agents <agents.json>]
//
// checks.json names the target's own checks: { "<name>": { "command": "<command>", "runs": ["local", "ci"] } }.
// A command is the target's own, as it would type it in sh; Guard does not interpret it.
// agents.json declares the providers whose agents should reach the Skill: { "providers": ["claude-code"] }.
// With it, Core's Agent Realization, built in KAAL's workspace, computes the further deployments; the
// delivery writes them as plain files and leaves neither Core's declaration nor its record in the target.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = join(HERE, "templates");
/** Core's Agent Realization as KAAL's workspace builds it (core/A6). */
const AGENT = resolve(HERE, "..", "..", "..", "packages", "kaal-core", "dist", "agent.js");
const RUNNER = ".githooks/guard.sh";
const HOOK = ".githooks/pre-push";
const WORKFLOW = ".github/workflows/guard.yml";
const DOCS = "GUARD.md";
/** Guard's Skill at its canonical location (guard/F25). */
const SKILL_NAME = "kaal-guard";
const SKILL = `.agents/skills/${SKILL_NAME}`;
const USAGE = "use --target <repo> --checks <checks.json> --branch <name> [--agents <agents.json>]";
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
    if (!["--target", "--checks", "--branch", "--agents"].includes(key) || value === undefined) stop(`unknown or incomplete option ${key}`, USAGE);
    out[key.slice(2)] = value;
  }
  for (const k of ["target", "checks", "branch"]) if (!out[k]) stop(`--${k} is missing`, USAGE);
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

/** The declared providers, validated: a list of plain names. */
function readAgents(path) {
  let agents;
  try {
    agents = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    stop(`${path} cannot be read: ${e.message}`);
  }
  const providers = agents?.providers;
  if (!Array.isArray(providers) || !providers.length || !providers.every((p) => typeof p === "string" && /^[a-z0-9-]+$/.test(p))) {
    stop(`${path} declares no providers`, 'write { "providers": ["claude-code", "codex", "copilot"] }');
  }
  return providers;
}

const template = (name) => readFileSync(join(TEMPLATES, name), "utf8").replace(/\r\n/g, "\n");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Every file under `dir`, by path relative to it with forward slashes. */
function walk(dir, prefix = "") {
  return readdirSync(join(dir, prefix), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(dir, `${prefix}${e.name}/`) : [`${prefix}${e.name}`]));
}

/**
 * The further deployments Core computes for `providers`, from the Skill's canonical files: what to
 * write outside the canonical location, what it keeps there and why, the pointers it proposes and the
 * providers it does not know. Core's record starts empty and is not kept: the target owns the files.
 */
export async function realize(target, providers, canonical) {
  if (!existsSync(AGENT)) stop("Core's Agent Realization is not built in KAAL's workspace", "run npm ci and npm run build in KAAL, or deliver without --agents");
  const core = await import(pathToFileURL(AGENT).href);
  const skills = [{ name: SKILL_NAME, files: Object.fromEntries(Object.entries(canonical).map(([p, t]) => [p, Buffer.from(t)])) }];
  // What is present at each path Core wants, and at each directory on the way to it.
  const present = {};
  for (const { path } of core.realize({ skills, providers, record: {}, present: {} }).write) {
    const parts = path.split("/");
    for (let i = 1; i <= parts.length; i++) {
      const p = parts.slice(0, i).join("/");
      if (existsSync(join(target, p)) && statSync(join(target, p)).isFile()) present[p] = sha256(readFileSync(join(target, p)));
    }
  }
  const plan = core.realize({ skills, providers, record: {}, present });
  const outside = (p) => !p.startsWith(`${SKILL}/`);
  return {
    write: plan.write.filter((w) => outside(w.path)).map((w) => ({ path: w.path, text: Buffer.from(w.bytes).toString("utf8") })),
    keep: plan.keep.filter((k) => outside(k.path)),
    pointers: plan.pointers,
    unknown: plan.unknown,
  };
}

/** The Skill's canonical files: the target's own when it has them, else Guard's template. */
function canonicalOf(target) {
  const dir = join(target, SKILL);
  if (existsSync(dir)) return Object.fromEntries(walk(dir).map((f) => [f, readFileSync(join(dir, f), "utf8")]));
  return { "SKILL.md": template("skills/kaal-guard/SKILL.md") };
}

/**
 * Each delivered file's content, from the templates and the target's checks. `agents` lists the
 * further deployments and pointers Core computed, for the docs.
 */
export function render(checks, target, agents = { write: [], pointers: [] }) {
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
  const copies = [...new Set(agents.write.map((w) => w.path.split("/").slice(0, -1).join("/")))].sort();
  const reach = [
    ...copies.map((d) => `- \`${d}/\`: a copy of the Skill, rendered from \`${SKILL}/\` for an agent that discovers Skills there, its frontmatter description taken from the Skill's Description section. Keep it in step when the canonical Skill changes.`),
    ...agents.pointers.map((p) => `- ${p.provider}: add a line to its instruction file naming \`${p.target}\`.`),
  ];
  const docs = template("GUARD.md")
    .replace("@CHECKS@", listed.join("\n"))
    .replace("@AGENTS@\n", reach.length ? `\nFor the agents this repository uses:\n\n${reach.join("\n")}\n` : "");
  const files = { [RUNNER]: runner, [HOOK]: template("pre-push"), [DOCS]: docs, [`${SKILL}/SKILL.md`]: template("skills/kaal-guard/SKILL.md") };
  if (ci.length) files[WORKFLOW] = workflow;
  for (const w of agents.write) files[w.path] = w.text;
  return files;
}

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { status: r.status, out: (r.stdout ?? "").trim(), err: (r.stderr ?? "").trim() };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { target: given, checks: checksPath, branch, agents: agentsPath } = options(process.argv.slice(2));
  const target = git(resolve(given), "rev-parse", "--show-toplevel").out;
  if (!target) stop(`${given} is not a Git working tree`);
  if (git(target, "status", "--porcelain").out) stop(`${target} has uncommitted changes`, "commit or stash them, then deliver again");
  if (git(target, "rev-parse", "--verify", "--quiet", `refs/heads/${branch}`).status === 0) stop(`branch ${branch} exists in the target`, "name a new branch");
  const checks = readChecks(checksPath);
  if (existsSync(join(target, RUNNER))) stop(`${RUNNER} exists in the target`, "Guard's runner would overwrite it; deliver by hand or rename it");

  const providers = agentsPath ? readAgents(agentsPath) : undefined;
  const agents = providers ? await realize(target, providers, canonicalOf(target)) : undefined;

  const kept = [];
  const files = render(checks, target, agents);
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
    else if (path.startsWith(`${SKILL}/`)) console.log("  The hook's reminder names it after a fail or cannot judge.");
  }
  for (const { path, reason } of agents?.keep ?? []) console.log(`kept ${path}: ${reason}.`);
  for (const p of agents?.unknown ?? []) console.log(`no deployment for ${p}: Core's placement table does not know it.`);
  console.log("Next: push the branch and open the pull request. After merging, each clone enables the hook with git config core.hooksPath .githooks, and the repository makes the Guard jobs required checks if a merge should depend on them.");
}
