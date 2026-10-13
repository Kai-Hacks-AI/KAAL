#!/usr/bin/env node
// PR isolation: two repository engineering controls, decided from changed paths alone.
//
//   1. Core travels alone. A change touching Core contains only Core and the
//      supporting files listed in CORE_SUPPORT.
//   2. .github travels alone. A change touching .github/ contains nothing outside it.
//
// Usage:
//   check.mjs --diff <base> <head>   judge the complete diff of head against its merge base with base
//   check.mjs < paths                judge newline-separated repository-relative paths from stdin
// Exits 0 when the change conforms, 1 with one line per offending path, 2 when it cannot judge.
//
// Limitation: the rules are path-level. An allowed supporting file passes whatever it contains.
import { execFileSync } from "node:child_process";
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

/** @param {string[]} paths repository-relative changed paths @returns {string[]} violations */
export function check(paths) {
  const violations = [];
  if (paths.some((p) => any(CORE, p))) {
    for (const p of paths) {
      if (!any(CORE, p) && !any(CORE_SUPPORT, p)) violations.push(`core travels alone: ${p} is not Core or its supporting files`);
    }
  }
  if (paths.some((p) => GITHUB.test(p))) {
    for (const p of paths) if (!GITHUB.test(p)) violations.push(`.github travels alone: ${p} is outside .github/`);
  }
  return violations;
}

/** Every path the PR changes against its target: both sides of a rename, all commits together. */
export function changedPaths(base, head, cwd) {
  const args = ["diff", "--no-ext-diff", "--no-relative", "--no-renames", "--name-only", "-z", "--end-of-options", `${base}...${head}`];
  const out = execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return out.split("\0").filter(Boolean);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const refuse = (message) => {
    console.error(message);
    process.exit(2);
  };
  let paths;
  if (args.length === 3 && args[0] === "--diff") {
    try {
      paths = changedPaths(args[1], args[2]);
    } catch (e) {
      refuse(`cannot diff ${args[1]}...${args[2]}: ${String(e.stderr || e.message).trim()}`);
    }
  } else if (args.length === 0) {
    paths = readFileSync(0, "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
    const unnormal = paths.find((p) => p.split("/").some((s) => s === "" || s === "." || s === ".."));
    if (unnormal) refuse(`not a repository-relative path: ${unnormal}`);
  } else refuse("usage: check.mjs --diff <base> <head> | check.mjs < paths");
  const violations = check(paths);
  for (const v of violations) console.error(v);
  if (violations.length) process.exit(1);
  console.log(`ok: ${paths.length} changed paths conform`);
}
