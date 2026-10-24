// The lifecycle: init, upgrade and remove. It owns exactly the files it records in guard.json under
// `managed`, each with its SHA-256, and the core.hooksPath it records under `config` when it set it.
// Nothing else in a repository is its own: a file it did not write, or one changed since, is reported
// and left in place. It reads the adapter templates as files and never imports them.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TEMPLATES = resolve(dirname(fileURLToPath(import.meta.url)), "../templates");
const HOOK = ".githooks/pre-push";
const WORKFLOW = ".github/workflows/guard.yml";
const HOOKS_PATH = ".githooks";

/** The line a pre-existing hook adds to run Guard's own: it runs kaal-guard run --local with the push's facts. */
const HOOK_LINE = `sh node_modules/@kaihacksai/kaal-guard/templates/pre-push "$@" || exit 1`;
const ADD_HOOK_LINE = [
  `  ${HOOK_LINE}`,
  "  It runs kaal-guard run --local with the push's facts, reading the push's lines on standard input.",
];

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const lf = (text) => text.replace(/\r\n/g, "\n");

/**
 * The workflow for these ci checks: one matrix entry per check. With none, the check job is left as a
 * comment until guard.json lists one and upgrade rewrites the file.
 */
export function workflow(checks, { verify = true } = {}) {
  const template = lf(readFileSync(join(TEMPLATES, "guard.yml"), "utf8"));
  const at = template.indexOf("\n  check:\n") + 1;
  let [head, job] = [template.slice(0, at), template.slice(at)];
  if (!verify) head = head.slice(0, head.indexOf("  guard:\n"));
  if (checks.length === 0) {
    return `${head}# guard.json lists no ci checks yet. List one, then run kaal-guard upgrade to give it this job.\n${job.replace(/^(?=.)/gm, "# ")}`;
  }
  return head + job.replace(/^( *)- \{ check: CHECK \}$/m, (_, indent) => checks.map((c) => `${indent}- { check: ${c} }`).join("\n"));
}

/**
 * The repository's own declarations, as the command reads them with verify's rule (F17): those in a
 * workflow Guard manages are Guard's, not the repository's, and do not count.
 */
const theirs = (declared, managed) => declared.filter((d) => !managed[d.file]);

/**
 * What each managed file holds in this version, given guard.json and the repository's own declarations.
 * The workflow carries jobs only for what they leave undeclared, and is absent when nothing remains.
 */
function contents(list, declared = []) {
  const ci = Object.keys(list.checks ?? {}).filter((n) => list.checks[n]?.runs?.includes?.("ci"));
  const names = new Set(declared.map((d) => d.name));
  const undeclared = ci.filter((n) => !names.has(n));
  const verify = !declared.some((d) => d.verify);
  const files = { [HOOK]: lf(readFileSync(join(TEMPLATES, "pre-push"), "utf8")) };
  if (verify || undeclared.length) files[WORKFLOW] = workflow(undeclared, { verify });
  return files;
}

/** The report of the repository's declarations that Guard executes and does not manage. */
const executed = (declared) => declared.map((d) => `${d.name} in job ${d.job} of ${d.file}`);

function git(root, ...args) {
  const r = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  return { status: r.status, out: (r.stdout ?? "").trim() };
}

/** The repository's top-level directory, or undefined outside a Git working tree. */
export function gitRoot(start) {
  const r = git(start, "rev-parse", "--show-toplevel");
  return r.status === 0 && r.out ? resolve(r.out) : undefined;
}

/** guard.json as an object, a fresh one when there is none, or { problem }. */
function readGuard(root) {
  const path = join(root, "guard.json");
  if (!existsSync(path)) return { list: { checks: {} } };
  try {
    const list = JSON.parse(readFileSync(path, "utf8"));
    if (!list || typeof list !== "object" || Array.isArray(list)) return { problem: "guard.json is not an object" };
    return { list };
  } catch (e) {
    return { problem: `guard.json cannot be read: ${e.message}` };
  }
}

function writeGuard(root, list) {
  writeFileSync(join(root, "guard.json"), JSON.stringify(list, null, 2) + "\n");
}

function writeManaged(root, path, text) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
  if (path === HOOK) chmodSync(join(root, path), 0o755);
  return sha256(Buffer.from(text));
}

/** True when the managed file is as Guard wrote it. */
const unmodified = (root, path, hash) => existsSync(join(root, path)) && sha256(readFileSync(join(root, path))) === hash;

const local = (root) => {
  const r = git(root, "config", "--local", "--get", "core.hooksPath");
  return r.status === 0 ? r.out : "";
};

/** Git's default hooks directory, where hooks run while core.hooksPath is unset, as Git names it from the root. */
const hooksDir = (root) => (git(root, "rev-parse", "--git-path", "hooks").out || ".git/hooks").split("\\").join("/");

/** The hooks a repository already runs from Git's default directory: any file there but Git's samples. */
function ownHooks(root) {
  const dir = resolve(root, hooksDir(root));
  return existsSync(dir) ? readdirSync(dir).filter((n) => !n.endsWith(".sample")).sort() : [];
}

/** Said after every init: installing files shows nothing runs, nor that anything is required. */
const NOT_PROOF = [
  "init writes files and configuration only. It does not show that Git runs the hook, that CI runs these jobs, or that a merge requires them.",
  "kaal-guard verify shows declared integration only; that CI ran a check is its job's evidence, and that a merge requires it is the repository's branch protection.",
];

/**
 * Writes the hook and the workflow where none exists. Sets core.hooksPath only where it is unset, the
 * hook there is Guard's own, and Git runs no hooks of the repository's own that setting it would turn off.
 * Returns { lines } or { problem }. The lines say, apart, what Guard installed, what it left
 * untouched, and what the repository still has to do itself.
 */
export function init(root, declarations = []) {
  const { list, problem } = readGuard(root);
  if (problem) return { problem };
  const managed = { ...(list.managed ?? {}) };
  const declared = theirs(declarations, managed);
  const installed = [];
  const untouched = [];
  const todo = [];
  for (const [path, text] of Object.entries(contents(list, declared))) {
    if (managed[path]) untouched.push(`${path}: Guard installed it before; kaal-guard upgrade updates it`);
    else if (existsSync(join(root, path))) {
      untouched.push(`${path}: it was there before Guard`);
      if (path === HOOK) todo.push(`To run Guard's local checks from ${HOOK}, add this line before it ends:`, ...ADD_HOOK_LINE);
      else todo.push(`For each ci check, give a job in ${path} or another workflow the step "- run: npx --no kaal-guard run --check <name> --github", then run kaal-guard verify.`);
    } else {
      managed[path] = writeManaged(root, path, text);
      installed.push(path);
    }
  }
  const config = { ...(list.config ?? {}) };
  const current = local(root);
  const own = ownHooks(root);
  if (!current && !managed[HOOK]) {
    untouched.push(`core.hooksPath: unset; Guard sets it only to run a ${HOOK} it installed`);
    todo.push(`Once ${HOOK} runs Guard's line, enable it with: git config core.hooksPath ${HOOKS_PATH}`);
  } else if (!current && own.length) {
    untouched.push(`core.hooksPath: unset, so Git runs ${own.join(", ")} from ${hooksDir(root)}; setting it would turn them off`);
    todo.push(`To run Guard's local checks, add this line to ${hooksDir(root)}/pre-push, or move those hooks to ${HOOKS_PATH} and run git config core.hooksPath ${HOOKS_PATH}:`, ...ADD_HOOK_LINE);
  } else if (!current) {
    if (git(root, "config", "--local", "core.hooksPath", HOOKS_PATH).status !== 0) return { problem: "git config core.hooksPath could not be set" };
    config["core.hooksPath"] = HOOKS_PATH;
    installed.push(`core.hooksPath = ${HOOKS_PATH}`);
  } else if (current !== HOOKS_PATH) {
    untouched.push(`core.hooksPath = ${current}: Guard did not set it, so Git does not run ${HOOK}`);
    todo.push(`To run Guard's local checks, add this line to ${current}/pre-push:`, ...ADD_HOOK_LINE);
  }
  todo.push("If a merge should depend on Guard's jobs, make them required checks in branch protection.");
  writeGuard(root, { ...list, checks: list.checks ?? {}, managed, ...(Object.keys(config).length ? { config } : {}) });
  const section = (title, items) => (items.length ? [title, ...items.map((i) => `  ${i}`)] : [title, "  nothing"]);
  return {
    lines: [
      ...section("installed by Guard:", installed),
      ...section("left untouched:", untouched),
      ...(declared.length ? section("executed by Guard, not managed:", executed(declared)) : []),
      ...section("still to do in this repository:", todo),
      ...NOT_PROOF,
    ],
  };
}

/** Rewrites each managed file that is unmodified to this version's content. Returns { lines } or { problem }. */
export function upgrade(root, declarations = []) {
  const { list, problem } = readGuard(root);
  if (problem) return { problem };
  const managed = { ...(list.managed ?? {}) };
  const declared = theirs(declarations, managed);
  const lines = [];
  const files = contents(list, declared);
  if (managed[WORKFLOW] && !files[WORKFLOW]) lines.push(`kept ${WORKFLOW}: the repository's own workflows now declare everything it runs; delete it if it is no longer wanted`);
  for (const [path, text] of Object.entries(files)) {
    const hash = managed[path];
    if (!hash) continue;
    if (!unmodified(root, path, hash)) {
      lines.push(`kept ${path}: changed since Guard wrote it, so it is yours now; Guard no longer updates it`);
      continue;
    }
    if (sha256(Buffer.from(text)) === hash) lines.push(`${path} is current`);
    else {
      managed[path] = writeManaged(root, path, text);
      lines.push(`upgraded ${path}`);
    }
  }
  writeGuard(root, { ...list, managed });
  if (declared.length) lines.push("executed by Guard, not managed:", ...executed(declared).map((l) => `  ${l}`));
  return { lines };
}

/** Removes the parents of a removed file that it left empty, up to the repository root. */
function prune(root, path) {
  for (let d = dirname(join(root, path)); d !== root && d.startsWith(root); d = dirname(d)) {
    if (readdirSync(d).length) return;
    rmdirSync(d);
  }
}

/**
 * Deletes each managed file that is unmodified, and unsets core.hooksPath if Guard set it. guard.json
 * stays: its checks are the repository's own. Returns { lines } or { problem }.
 */
export function remove(root) {
  const { list, problem } = readGuard(root);
  if (problem) return { problem };
  const lines = [];
  for (const [path, hash] of Object.entries(list.managed ?? {})) {
    if (!existsSync(join(root, path))) continue;
    if (!unmodified(root, path, hash)) {
      lines.push(`kept ${path}: changed since Guard wrote it, so it is yours`);
      continue;
    }
    rmSync(join(root, path));
    prune(root, path);
    lines.push(`removed ${path}`);
  }
  const set = list.config?.["core.hooksPath"];
  if (set && local(root) === set) {
    git(root, "config", "--local", "--unset", "core.hooksPath");
    lines.push("unset core.hooksPath");
  }
  const { managed, config, ...rest } = list;
  writeGuard(root, rest);
  return { lines };
}
