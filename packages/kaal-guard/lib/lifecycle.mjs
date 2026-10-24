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

/** guard.json as an object with its text, a fresh one with no text when there is none, or { problem }. */
function readGuard(root) {
  const path = join(root, "guard.json");
  if (!existsSync(path)) return { list: { checks: {} } };
  try {
    const text = readFileSync(path, "utf8");
    const list = JSON.parse(text);
    if (!list || typeof list !== "object" || Array.isArray(list)) return { problem: "guard.json is not an object" };
    return { list, text };
  } catch (e) {
    return { problem: `guard.json cannot be read: ${e.message}` };
  }
}

/** Where the string that opens at `i` ends: the index of its closing quote. */
function stringEnd(text, i) {
  let j = i + 1;
  while (text[j] !== '"') j += text[j] === "\\" ? 2 : 1;
  return j;
}

/**
 * The top-level members of a JSON object's text, already known to parse: for each, its key, where the
 * member starts, where its value starts and where the value ends. Also where the object opens and closes.
 */
function members(text) {
  const found = [];
  let depth = 0;
  let open = -1;
  let member = null;
  const last = (i) => {
    let j = i;
    while (/\s/.test(text[j - 1])) j--;
    return j;
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      const j = stringEnd(text, i);
      if (depth === 1 && !member) member = { key: JSON.parse(text.slice(i, j + 1)), start: i, keyEnd: j + 1 };
      i = j;
    } else if (c === "{" || c === "[") {
      if (depth++ === 0) open = i;
    } else if (c === "}" || c === "]") {
      if (--depth === 0) {
        if (member) found.push({ ...member, valueEnd: last(i) });
        return { open, close: i, found };
      }
    } else if (depth === 1 && c === ":" && member && member.valueStart === undefined) {
      let j = i + 1;
      while (/\s/.test(text[j])) j++;
      member.valueStart = j;
    } else if (depth === 1 && c === ",") {
      found.push({ ...member, valueEnd: last(i) });
      member = null;
    }
  }
  throw new Error("guard.json has no closing brace");
}

/**
 * guard.json's text with only Guard's own entries changed: each entry of `own` set to its value, or
 * deleted where the value is undefined. Every other byte stays, and the result follows the text's own
 * line ending, indentation and spacing. Returns null when nothing changes.
 */
function edit(text, list, own) {
  const { open, close, found } = members(text);
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const first = found[0];
  const lead = first ? text.slice(open + 1, first.start) : "";
  const pretty = lead.includes("\n");
  const indent = pretty ? lead.slice(lead.lastIndexOf("\n") + 1) : "";
  const colon = first ? text.slice(first.keyEnd, first.valueStart) : pretty ? ": " : ":";
  const value = (v) => (pretty ? JSON.stringify(v, null, indent || "  ").split("\n").join(eol + indent) : JSON.stringify(v));
  const ops = [];
  const added = [];
  for (const [key, v] of Object.entries(own)) {
    const at = found.findIndex((m) => m.key === key);
    if (JSON.stringify(list[key]) === JSON.stringify(v)) continue;
    if (at < 0) {
      if (v !== undefined) added.push(`${JSON.stringify(key)}${colon}${value(v)}`);
      continue;
    }
    const m = found[at];
    if (v !== undefined) ops.push([m.valueStart, m.valueEnd, value(v)]);
    else if (at > 0) ops.push([found[at - 1].valueEnd, m.valueEnd, ""]);
    else if (found[1]) ops.push([m.start, found[1].start, ""]);
    else ops.push([open + 1, close, ""]);
  }
  if (added.length) {
    const sep = pretty ? `,${eol}${indent}` : ",";
    const tail = found.at(-1);
    if (tail) ops.push([tail.valueEnd, tail.valueEnd, sep + added.join(sep)]);
    else ops.push([open + 1, close, `${eol}  ${added.join(`,${eol}  `)}${eol}`]);
  }
  if (!ops.length) return null;
  let out = text;
  for (const [from, to, insert] of ops.sort((a, b) => b[0] - a[0])) out = out.slice(0, from) + insert + out.slice(to);
  return out;
}

/**
 * Writes Guard's own entries of guard.json. An existing file is edited in place (F18); a new one gets
 * the repository's checks, empty, and Guard's entries.
 */
function writeGuard(root, { list, text }, own) {
  if (text === undefined) {
    const fresh = { checks: list.checks ?? {} };
    for (const [key, v] of Object.entries(own)) if (v !== undefined) fresh[key] = v;
    writeFileSync(join(root, "guard.json"), JSON.stringify(fresh, null, 2) + "\n");
    return;
  }
  const out = edit(text, list, own);
  if (out !== null) writeFileSync(join(root, "guard.json"), out);
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
export function init(root) {
  const read = readGuard(root);
  const { list, problem } = read;
  if (problem) return { problem };
  const managed = { ...(list.managed ?? {}) };
  const installed = [];
  const untouched = [];
  const todo = [];
  for (const [path, text] of Object.entries(contents(list))) {
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
  writeGuard(root, read, { managed, config: Object.keys(config).length ? config : list.config });
  const section = (title, items) => (items.length ? [title, ...items.map((i) => `  ${i}`)] : [title, "  nothing"]);
  return {
    lines: [
      ...section("installed by Guard:", installed),
      ...section("left untouched:", untouched),
      ...section("still to do in this repository:", todo),
      ...NOT_PROOF,
    ],
  };
}

/** Rewrites each managed file that is unmodified to this version's content. Returns { lines } or { problem }. */
export function upgrade(root) {
  const read = readGuard(root);
  const { list, problem } = read;
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
  writeGuard(root, read, { managed });
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
  const read = readGuard(root);
  const { list, problem } = read;
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
  writeGuard(root, read, { managed: undefined, config: undefined });
  return { lines };
}
