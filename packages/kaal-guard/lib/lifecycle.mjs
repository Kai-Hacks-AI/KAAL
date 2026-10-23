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
const HOOK_LINE = `sh node_modules/kaal-guard/templates/pre-push "$@" || exit 1`;
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
export function workflow(checks) {
  const template = lf(readFileSync(join(TEMPLATES, "guard.yml"), "utf8"));
  const at = template.indexOf("\n  check:\n") + 1;
  const [head, job] = [template.slice(0, at), template.slice(at)];
  if (checks.length === 0) {
    return `${head}# guard.json lists no ci checks yet. List one, then run kaal-guard upgrade to give it this job.\n${job.replace(/^(?=.)/gm, "# ")}`;
  }
  return head + job.replace(/^( *)- \{ check: CHECK \}$/m, (_, indent) => checks.map((c) => `${indent}- { check: ${c} }`).join("\n"));
}

/** What each managed file holds in this version, given guard.json. */
function contents(list) {
  const ci = Object.keys(list.checks ?? {}).filter((n) => list.checks[n]?.runs?.includes?.("ci"));
  return { [HOOK]: lf(readFileSync(join(TEMPLATES, "pre-push"), "utf8")), [WORKFLOW]: workflow(ci) };
}

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

/** Writes the hook and the workflow where none exists, and sets core.hooksPath where it is unset. Returns { lines } or { problem }. */
export function init(root) {
  const { list, problem } = readGuard(root);
  if (problem) return { problem };
  const managed = { ...(list.managed ?? {}) };
  const lines = [];
  for (const [path, text] of Object.entries(contents(list))) {
    if (managed[path]) lines.push(`kept ${path}: Guard manages it already; kaal-guard upgrade updates it`);
    else if (existsSync(join(root, path))) {
      lines.push(`kept ${path}, which Guard did not write.`);
      if (path === HOOK) lines.push("  To run Guard's local checks from it, add this line before it ends:", ...ADD_HOOK_LINE);
      else lines.push(`  For each ci check, give a job the step "- run: npx kaal-guard run --check <name> --github", then run kaal-guard verify.`);
    } else {
      managed[path] = writeManaged(root, path, text);
      lines.push(`wrote ${path}`);
    }
  }
  const config = { ...(list.config ?? {}) };
  const current = local(root);
  if (!current) {
    if (git(root, "config", "--local", "core.hooksPath", HOOKS_PATH).status !== 0) return { problem: "git config core.hooksPath could not be set" };
    config["core.hooksPath"] = HOOKS_PATH;
    lines.push(`set core.hooksPath to ${HOOKS_PATH}`);
  } else if (current !== HOOKS_PATH) {
    lines.push(`kept core.hooksPath ${current}, which Guard did not set, so Git does not run ${HOOK}.`);
    lines.push(`  To run Guard's local checks, add this line to ${current}/pre-push:`, ...ADD_HOOK_LINE);
  }
  writeGuard(root, { ...list, checks: list.checks ?? {}, managed, ...(Object.keys(config).length ? { config } : {}) });
  return { lines };
}

/** Rewrites each managed file that is unmodified to this version's content. Returns { lines } or { problem }. */
export function upgrade(root) {
  const { list, problem } = readGuard(root);
  if (problem) return { problem };
  const managed = { ...(list.managed ?? {}) };
  const lines = [];
  for (const [path, text] of Object.entries(contents(list))) {
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
