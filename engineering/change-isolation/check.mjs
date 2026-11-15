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
export class CannotJudge extends Error { constructor(m) { super(m); this.name = "CannotJudge"; } }

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

/** Validate one ledger entry's shape and reach. Throws CannotJudge. `ids` is the set of ids already seen. */
export function validateEntry(e, ids = new Set()) {
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

/** @param {string} text the ledger's JSON @returns {{id: string, paths: string[], pre: object, post: object}[]} */
export function readLedger(text) {
  let doc;
  try { doc = JSON.parse(text); } catch { throw new CannotJudge("ledger is not valid JSON"); }
  if (!doc || typeof doc !== "object" || Array.isArray(doc) || doc.version !== 1 || !Array.isArray(doc.transitions))
    throw new CannotJudge("ledger must be { version: 1, transitions: [...] }");
  const ids = new Set();
  for (const e of doc.transitions) validateEntry(e, ids);
  return doc.transitions;
}

// A promotion may carry its own entry (engineering/change-isolation/ledger-in-promotion-plan.md). The entry
// is one appended element of the candidate's ledger; it admits the change only with an attestation
// (`attested`) that a trusted adapter derived from an author-independent code-owner review at the exact head.
// This file never reads reviews: it only compares the attested id and digest with its own canonical digest.

/** Raised for an entry that has more than one spelling. */
export class NotCanonical extends Error { constructor(m) { super(m); this.name = "NotCanonical"; } }

// Foundation's one SHA-256 (AGENTS.md: no node:crypto for a KAAL digest). Resolved from the package where the
// workspace is installed, otherwise from the verbatim copy the wrapper script places beside this file
// (git show <target>:packages/kaal-foundation/05-src/skills/kaal-foundation/scripts/sha256.mjs, else the pre-layout lib/sha256.mjs). With neither, digests cannot be judged.
let sha256Impl;
for (const specifier of ["@kaihacksai/kaal-foundation/sha256", "./kaal-foundation-sha256.mjs"]) {
  try { sha256Impl = (await import(specifier)).sha256; break; } catch { /* try the next */ }
}

const ID = /^[a-z0-9][a-z0-9-]*$/;
const utf16 = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** RFC 8785 bytes of an entry with exactly the keys id, paths, pre, post. Throws NotCanonical. */
export function canonicalEntry(e) {
  const no = (why) => new NotCanonical(why);
  if (!e || typeof e !== "object" || Array.isArray(e)) throw no("entry is not an object");
  if (Object.keys(e).sort().join(",") !== "id,paths,post,pre") throw no("entry must have exactly the keys id, paths, pre, post");
  if (typeof e.id !== "string" || !ID.test(e.id)) throw no("id is not [a-z0-9][a-z0-9-]*");
  if (!Array.isArray(e.paths) || e.paths.length === 0 || e.paths.some((q) => typeof q !== "string")) throw no("paths must be a non-empty list of strings");
  for (let i = 1; i < e.paths.length; i++)
    if (Buffer.compare(Buffer.from(e.paths[i - 1], "utf8"), Buffer.from(e.paths[i], "utf8")) >= 0) throw no("paths must be unique and in ascending UTF-8 byte order");
  const side = (m, name) => {
    if (!m || typeof m !== "object" || Array.isArray(m)) throw no(`${name} must be an object`);
    const keys = Object.keys(m);
    if (keys.length !== e.paths.length || keys.some((k) => !e.paths.includes(k))) throw no(`${name} must name exactly the entry's paths`);
    for (const v of Object.values(m)) if (v !== null && !(typeof v === "string" && BLOB.test(v))) throw no(`${name} holds a value that is not a blob id or null`);
    return `{${keys.sort(utf16).map((k) => `${JSON.stringify(k)}:${m[k] === null ? "null" : JSON.stringify(m[k])}`).join(",")}}`;
  };
  const text = `{"id":${JSON.stringify(e.id)},"paths":[${e.paths.map((q) => JSON.stringify(q)).join(",")}],"post":${side(e.post, "post")},"pre":${side(e.pre, "pre")}}`;
  return Buffer.from(text, "utf8");
}

/** Lowercase hex SHA-256 of the canonical bytes, via Foundation. */
export function entryDigest(e) {
  if (typeof sha256Impl !== "function") throw new CannotJudge("Foundation SHA-256 is not reachable from the checker");
  return sha256Impl(canonicalEntry(e));
}

/** A strict JSON parser that refuses duplicate keys at any depth (JSON.parse would silently keep the last). */
function parseStrict(text) {
  let i = 0;
  const fail = (why) => { throw new CannotJudge(`ledger is not strict JSON: ${why}`); };
  const ws = () => { while (" \t\n\r".includes(text[i]) && i < text.length) i++; };
  const value = () => {
    ws();
    const c = text[i];
    if (c === "{") {
      i++; const o = Object.create(null); ws();
      if (text[i] === "}") { i++; return o; }
      for (;;) {
        ws(); if (text[i] !== '"') fail("expected a key");
        const k = string(); ws(); if (text[i++] !== ":") fail("expected ':'");
        if (Object.prototype.hasOwnProperty.call(o, k)) fail(`duplicate key ${JSON.stringify(k)}`);
        Object.defineProperty(o, k, { value: value(), enumerable: true, writable: true, configurable: true }); ws();
        if (text[i] === ",") { i++; continue; }
        if (text[i++] === "}") return o;
        fail("expected ',' or '}'");
      }
    }
    if (c === "[") {
      i++; const a = []; ws();
      if (text[i] === "]") { i++; return a; }
      for (;;) {
        a.push(value()); ws();
        if (text[i] === ",") { i++; continue; }
        if (text[i++] === "]") return a;
        fail("expected ',' or ']'");
      }
    }
    if (c === '"') return string();
    const m = /^(?:-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(text.slice(i));
    if (!m) fail("unexpected token");
    i += m[0].length;
    return JSON.parse(m[0]);
  };
  const string = () => {
    const start = i++;
    while (i < text.length && text[i] !== '"') i += text[i] === "\\" ? 2 : 1;
    if (text[i++] !== '"') fail("unterminated string");
    return JSON.parse(text.slice(start, i));
  };
  const v = value(); ws();
  if (i !== text.length) fail("trailing characters");
  return v;
}

/**
 * The one entry the candidate's ledger appends to the target's, or the reason it is not exactly that.
 * @returns {{entry: object} | {violation: string}}
 */
export function appendedEntry(targetText, candidateText) {
  let target, candidate;
  try { target = parseStrict(targetText); candidate = parseStrict(candidateText); }
  catch (e) { if (e instanceof CannotJudge) return { violation: e.message }; throw e; }
  const list = (d) => (d && d.version === 1 && Array.isArray(d.transitions) && Object.keys(d).length === 2 ? d.transitions : null);
  const before = list(target), after = list(candidate);
  if (!before) throw new CannotJudge("the target's ledger must be { version: 1, transitions: [...] }");
  if (!after) return { violation: "the candidate's ledger must be { version: 1, transitions: [...] }" };
  if (after.length !== before.length + 1) return { violation: `the ledger must gain exactly one entry (${before.length} before, ${after.length} after)` };
  if (JSON.stringify(after.slice(0, before.length)) !== JSON.stringify(before)) return { violation: "an existing ledger entry was edited, removed or reordered" };
  const entry = after[before.length];
  try { validateEntry(entry, new Set(before.map((x) => x.id))); } catch (e) { if (e instanceof CannotJudge) return { violation: e.message }; throw e; }
  // The parser's null-prototype objects stay inside the parser: callers get an ordinary copy.
  return { entry: JSON.parse(JSON.stringify(entry)) };
}

/**
 * @param {string[]} paths the change's paths
 * @param {{ledger?: object[], facts?: (path: string) => {base: string|null, head: string|null}}} [target]
 *   ledger: entries from readLedger, read from the target. facts: the Git blob ids of a path at the
 *   target's tip (base) and at the candidate (head); null when the path is absent there.
 * @returns {string[]} violations
 */
export function check(paths, { ledger = [], facts, carried, attested } = {}) {
  const violations = [];
  const set = [...new Set(paths)].sort();
  let admitted = false;
  const entries = ledger.map((entry) => ({ entry, set }));
  if (carried && attested) {
    if (typeof sha256Impl !== "function") throw new CannotJudge("Foundation SHA-256 is not reachable from the checker, so the carried entry cannot be judged");
    // The carried entry covers the change minus the ledger file itself, and only with a matching attestation.
    try {
      validateEntry(carried);
      if (!set.includes(LEDGER)) throw new CannotJudge("the change does not touch the ledger");
      if (attested.id !== carried.id || attested.digest !== entryDigest(carried))
        violations.push(`carried transition ${carried.id}: the attestation does not match the entry's canonical digest`);
      else entries.push({ entry: carried, set: set.filter((q) => q !== LEDGER) });
    } catch (e) {
      if (!(e instanceof CannotJudge || e instanceof NotCanonical)) throw e;
      violations.push(`carried transition ${carried.id}: ${e.message}`);
    }
  }
  for (const { entry, set } of entries) {
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
  const usage = "usage: check.mjs [--ledger <file> --git <base> <head> [--candidate-ledger <file> (--attested <id>:<sha256> | --attestation deferred)]] < paths";
  const args = process.argv.slice(2);
  let ledger = [];
  let facts;
  let carriedEntry, attestedFact, deferred = false, deferredFiles;
  if (args.length) {
    if (args.length < 5 || args[0] !== "--ledger" || args[2] !== "--git") refuse(usage);
    const [, file, , base, head, ...rest] = args;
    let candidateFile;
    for (let i = 0; i < rest.length; i += 2) {
      if (rest[i] === "--candidate-ledger" && candidateFile === undefined && rest[i + 1]) candidateFile = rest[i + 1];
      else if (rest[i] === "--attested" && attestedFact === undefined && !deferred && rest[i + 1]) attestedFact = rest[i + 1];
      else if (rest[i] === "--attestation" && rest[i + 1] === "deferred" && attestedFact === undefined && !deferred) deferred = true;
      else refuse(usage);
    }
    if (deferred && candidateFile === undefined) refuse(usage);
    try { ledger = readLedger(readFileSync(file, "utf8")); } catch (e) { refuse(e instanceof CannotJudge ? e.message : `ledger unreadable: ${e.code ?? e.message}`); }
    facts = (path) => ({ base: gitBlob(base, path), head: gitBlob(head, path) });
    if (attestedFact !== undefined) {
      const m = /^([a-z0-9][a-z0-9-]*):([0-9a-f]{64})$/.exec(attestedFact);
      if (!m || candidateFile === undefined) refuse(usage);
      attestedFact = { id: m[1], digest: m[2] };
    }
    if (attestedFact !== undefined) {
      try {
        const r = appendedEntry(readFileSync(file, "utf8"), readFileSync(candidateFile, "utf8"));
        if (r.entry) carriedEntry = r.entry;
        else { console.error(`carried ledger entry: ${r.violation}`); process.exit(1); }
      } catch (e) { refuse(e instanceof CannotJudge ? e.message : `candidate ledger unreadable: ${e.code ?? e.message}`); }
    }
    deferredFiles = deferred ? { file, candidateFile } : undefined;
  }
  const input = readFileSync(0, "utf8");
  const paths = input.split(input.includes("\0") ? "\0" : "\n").filter(Boolean);
  const unnormal = paths.find((p) => p.split("/").some((s) => s === "" || s === "." || s === ".."));
  if (unnormal !== undefined) refuse(`not a repository-relative path: ${unnormal}`);
  // Deferred: the entry is the ledger's one appended entry, but only when the change itself touches the ledger. A pull
  // request that predates a ledger addition on the target differs from it without having changed it, and is judged by the
  // default rules like any ordinary change. Judge everything except the attestation: the entry is assumed attested with its
  // own digest, so its shape, paths, blobs and exclusions are all enforced; the pending line is printed for the review check.
  if (deferredFiles && paths.includes(LEDGER)) {
    try {
      const r = appendedEntry(readFileSync(deferredFiles.file, "utf8"), readFileSync(deferredFiles.candidateFile, "utf8"));
      if (!r.entry) { console.error(`carried ledger entry: ${r.violation}`); process.exit(1); }
      carriedEntry = r.entry;
      attestedFact = { id: carriedEntry.id, digest: entryDigest(carriedEntry) };
    } catch (e) { refuse(e instanceof CannotJudge ? e.message : `candidate ledger unreadable: ${e.code ?? e.message}`); }
  }
  let violations;
  try { violations = check(paths, { ledger, facts, carried: carriedEntry, attested: attestedFact }); } catch (e) {
    if (e instanceof CannotJudge) refuse(e.message);
    throw e;
  }
  for (const v of violations) console.error(v);
  if (violations.length) process.exit(1);
  console.log(`ok: ${paths.length} changed paths conform`);
  if (deferred && carriedEntry) console.log(`attestation deferred: ledger-entry: ${carriedEntry.id} sha256:${attestedFact.digest} (the review check judges it)`);
}
