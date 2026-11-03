#!/usr/bin/env node
// Change Isolation: two repository engineering controls, decided from changed paths alone.
//
//   1. Core travels alone. A change touching Core contains only Core and the
//      supporting files listed in CORE_SUPPORT.
//   2. .github travels alone. A change touching .github/ contains nothing outside it.
//
//   3. A transition ledger entry held by the target can admit one exact multi-owner change (see
//      "Transition ledger" below). With no ledger, or no matching entry, rules 1 and 2 are unchanged.
//
// Usage: check.mjs [--ledger <file> --git <base> <head>] < paths
// Reads the change's repository-relative paths from stdin, NUL- or newline-separated. The caller
// supplies the complete change, both sides of every rename; this file alone defines the rules.
// Exits 0 when the change conforms, 1 with one line per offending path, 2 when it cannot judge.
//
// Limitation: the rules are path-level. An allowed supporting file passes whatever it contains.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Paths that are Core: the package and the Engine files deployed from its payload. */
const CORE = [/^packages\/kaal-core\//, /^\.kaal\/(AGENTS\.md|KAAL-KERNEL\.md|core\/)/];

/** Paths that may travel with Core and nothing else besides. */
const CORE_SUPPORT = [
  /^package\.json$/, // root workspace metadata
  /^package-lock\.json$/, // root lockfile
  /^engineering\/acceptance\/embed\.test\.mjs$/, // Core's own acceptance evidence
];

const GITHUB = /^\.github\//;

const any = (patterns, path) => patterns.some((p) => p.test(path));

/** Raised when the checker cannot judge: a malformed ledger or missing facts. The CLI exits 2. */
export class CannotJudge extends Error {}

// Transition ledger. One entry admits one exact change that Core-travels-alone would otherwise refuse,
// for example a package identity or version transition that spans owners. The ledger is held by the
// target branch and is supplied by the caller from the target's tip, never from the candidate, so a
// candidate cannot authorize itself. An entry commits to the complete path set and to the exact Git
// blob of every path before (pre) and after (post) the change; null means the path is absent. It
// matches only when the candidate's path set equals its paths and every blob equals its commitment.
// Once the target holds the post state the pre blobs no longer match, so an entry is spent by
// adoption and cannot be replayed. An entry never admits .github paths, the ledger or this checker.
export const LEDGER = "engineering/change-isolation/transitions.json";
const CHECKER = "engineering/change-isolation/check.mjs";
const BLOB = /^[0-9a-f]{40}$/;

/** @param {string} text the ledger's JSON @returns {{id: string, paths: string[], pre: object, post: object}[]} */
export function readLedger(text) {
  let doc;
  try { doc = JSON.parse(text); } catch { throw new CannotJudge("ledger is not valid JSON"); }
  if (!doc || typeof doc !== "object" || Array.isArray(doc) || doc.version !== 1 || !Array.isArray(doc.transitions))
    throw new CannotJudge("ledger must be { version: 1, transitions: [...] }");
  const ids = new Set();
  for (const e of doc.transitions) {
    const bad = (why) => new CannotJudge(`ledger entry ${JSON.stringify(e?.id)}: ${why}`);
    if (!e || typeof e !== "object" || typeof e.id !== "string" || !e.id || ids.has(e.id)) throw bad("id missing or duplicated");
    ids.add(e.id);
    if (!Array.isArray(e.paths) || e.paths.length === 0 || new Set(e.paths).size !== e.paths.length) throw bad("paths must be a non-empty list without duplicates");
    for (const q of e.paths) {
      if (typeof q !== "string" || q.split("/").some((x) => x === "" || x === "." || x === "..")) throw bad(`not a repository-relative path: ${q}`);
      if (GITHUB.test(q) || q === LEDGER || q === CHECKER) throw bad(`${q} cannot be admitted by a ledger entry`);
    }
    for (const side of ["pre", "post"]) {
      const m = e[side];
      if (!m || typeof m !== "object" || Array.isArray(m)) throw bad(`${side} must map every path to a blob id or null`);
      const keys = Object.keys(m).sort();
      if (keys.join("\0") !== [...e.paths].sort().join("\0")) throw bad(`${side} must name exactly the entry's paths`);
      for (const v of Object.values(m)) if (v !== null && !(typeof v === "string" && BLOB.test(v))) throw bad(`${side} holds a value that is not a blob id or null`);
    }
  }
  return doc.transitions;
}

/**
 * @param {string[]} paths the change's paths
 * @param {{ledger?: object[], facts?: (path: string) => {base: string|null, head: string|null}}} [target]
 *   ledger: entries from readLedger, read from the target. facts: the Git blob ids of a path at the
 *   target's tip (base) and at the candidate (head); null when the path is absent there.
 * @returns {string[]} violations
 */
export function check(paths, { ledger = [], facts } = {}) {
  const violations = [];
  const set = [...new Set(paths)].sort();
  let admitted = false;
  for (const entry of ledger) {
    const same = [...entry.paths].sort();
    if (same.length !== set.length || same.some((q, i) => q !== set[i])) continue;
    if (typeof facts !== "function") throw new CannotJudge(`transition ${entry.id}: the change matches its paths but no Git facts were supplied`);
    const off = [];
    for (const q of same) {
      const f = facts(q);
      if (f.base !== entry.pre[q]) off.push(`transition ${entry.id}: ${q} at the target is ${f.base}, not the ledger's ${entry.pre[q]} (stale or already adopted)`);
      if (f.head !== entry.post[q]) off.push(`transition ${entry.id}: ${q} in the change is ${f.head}, not the ledger's ${entry.post[q]}`);
    }
    if (off.length === 0) admitted = true;
    else violations.push(...off);
  }
  if (!admitted && paths.some((p) => any(CORE, p))) {
    for (const p of paths) {
      if (!any(CORE, p) && !any(CORE_SUPPORT, p)) violations.push(`core travels alone: ${p} is not Core or its supporting files`);
    }
  }
  if (paths.some((p) => GITHUB.test(p))) {
    for (const p of paths) if (!GITHUB.test(p)) violations.push(`.github travels alone: ${p} is outside .github/`);
  }
  return violations;
}

/**
 * The Git blob id of `path` at `rev`, or null when the commit resolves and the path is genuinely
 * absent from its tree. Anything else is missing or unavailable evidence and cannot be judged:
 * an unresolvable or non-commit revision, a git failure, a path that is not a file at that
 * revision, or output that is not exactly one entry for the path. `git rev-parse rev:path` is not
 * used because its failure for an unresolved revision:path (status 128) and for an absent path
 * cannot be told apart safely.
 */
export function gitBlob(rev, path, { cwd } = {}) {
  const git = (...args) => spawnSync("git", args, { cwd, encoding: "utf8" });
  const commit = git("rev-parse", "--verify", "-q", "--end-of-options", `${rev}^{commit}`);
  if (commit.status !== 0 || !/^[0-9a-f]{40,64}$/.test(commit.stdout.trim())) throw new CannotJudge(`git cannot resolve ${rev} to a commit`);
  const listed = git("ls-tree", "-z", "--full-tree", commit.stdout.trim(), "--", path);
  if (listed.status !== 0) throw new CannotJudge(`git could not read ${path} at ${rev}`);
  const entries = listed.stdout.split("\0").filter(Boolean);
  if (entries.length === 0) return null;
  const m = entries.length === 1 && /^(\d{6}) (\w+) ([0-9a-f]{40,64})\t(.*)$/s.exec(entries[0]);
  if (!m || m[4] !== path || m[2] !== "blob") throw new CannotJudge(`${path} at ${rev} is not a single file entry`);
  return m[3];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const refuse = (message) => {
    console.error(message);
    process.exit(2);
  };
  const usage = "usage: check.mjs [--ledger <file> --git <base> <head>] < paths";
  const args = process.argv.slice(2);
  let ledger = [];
  let facts;
  if (args.length) {
    if (args.length !== 5 || args[0] !== "--ledger" || args[2] !== "--git") refuse(usage);
    const [, file, , base, head] = args;
    try { ledger = readLedger(readFileSync(file, "utf8")); } catch (e) { refuse(e instanceof CannotJudge ? e.message : `ledger unreadable: ${e.code ?? e.message}`); }
    facts = (path) => ({ base: gitBlob(base, path), head: gitBlob(head, path) });
  }
  const input = readFileSync(0, "utf8");
  const paths = input.split(input.includes("\0") ? "\0" : "\n").filter(Boolean);
  const unnormal = paths.find((p) => p.split("/").some((s) => s === "" || s === "." || s === ".."));
  if (unnormal !== undefined) refuse(`not a repository-relative path: ${unnormal}`);
  let violations;
  try { violations = check(paths, { ledger, facts }); } catch (e) {
    if (e instanceof CannotJudge) refuse(e.message);
    throw e;
  }
  for (const v of violations) console.error(v);
  if (violations.length) process.exit(1);
  console.log(`ok: ${paths.length} changed paths conform`);
}
