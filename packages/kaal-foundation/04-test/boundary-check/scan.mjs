#!/usr/bin/env node
// Foundation's Boundary Check scan (foundation/F34 to foundation/F36). It finds what Foundation owns, the byte-level
// SHA-256, being done somewhere else, and reports each place as a finding. It decides nothing: a finding is a place
// to look at, never a fault, and an empty list is no compliance.
//   node scan.mjs --target <path>... [--base <dir>]
// Targets are input (foundation/N22): the caller names them; this file names none. A path is resolved against --base
// (default: the current directory), and a finding id is `kaal-foundation/<file relative to base>:<line>`.
// The last line of standard output is `kaal-foundation-scan {json}`. Exit 0 when the scan is complete (findings are
// not failures), 2 when it is unknown or the call is wrong; never 1. It only reads files (foundation/N20) and uses
// only Node's built-in modules and the sha256.mjs shipped beside it (foundation/N21). Run it from dist/.
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { sha256 } from "../../skills/kaal-foundation/scripts/sha256.mjs";

const LINE = "kaal-foundation-scan";
const SOURCE = /\.(?:[cm]?js|[cm]?ts)$/;
const NOT_WALKED = new Set(["node_modules", ".git"]);
const OWNER = "Foundation";
const OWNERSHIP = "ownership.kaal.json";
const LIBRARY = new URL("../../skills/kaal-foundation/scripts/", import.meta.url);
const ALGORITHM = [/0x428a2f98/i, /0x71374491/i];
const PLATFORM = [/createHash\(\s*(["'`])sha-?256\1/i, /digest\(\s*(["'`])sha-?256\1/i];

const args = process.argv.slice(2);
const values = (flag) => args.flatMap((a, i) => (a === flag ? [args[i + 1]] : []));
const targets = values("--target");
const baseArg = values("--base")[0];
const finish = (result, code) => {
  console.log(`${LINE} ${JSON.stringify(result)}`);
  process.exitCode = code;
};

if (!targets.length || targets.some((t) => t === undefined || t.startsWith("--")) || (args.includes("--base") && (baseArg === undefined || baseArg.startsWith("--")))) {
  console.error("usage: node scan.mjs --target <path>... [--base <dir>]");
  process.exitCode = 2;
} else {
  const base = resolve(baseArg ?? process.cwd());
  const rel = (path) => relative(base, path).split(sep).join("/") || ".";
  const unreadable = [];
  const skipped = [];
  const findings = [];
  let read = 0;

  // The bytes of Foundation's own library, so a copy of it is found by content. If they cannot be read the scan cannot judge.
  let library = null;
  try {
    library = ["sha256.mjs", "sha256.d.ts"].map((name) => sha256(readFileSync(new URL(name, LIBRARY))));
  } catch {
    unreadable.push({ path: "sha256.mjs shipped beside the scan", cause: "unreadable" });
  }

  // The owner of a directory is the name in the nearest ownership.kaal.json at or above it, within the base.
  const owners = new Map();
  const ownerOf = (dir) => {
    if (owners.has(dir)) return owners.get(dir);
    let owner;
    try {
      owner = JSON.parse(readFileSync(join(dir, OWNERSHIP), "utf8"))?.owner?.name ?? null;
    } catch {
      owner = undefined;
    }
    if (owner === undefined) {
      const inside = relative(base, dir);
      owner = dir === base || inside === "" || inside.startsWith("..") ? null : ownerOf(dirname(dir));
    }
    owners.set(dir, owner);
    return owner;
  };

  const scanFile = (path) => {
    let bytes;
    try {
      bytes = readFileSync(path);
    } catch {
      unreadable.push({ path: rel(path), cause: "unreadable" });
      return;
    }
    read += 1;
    const file = rel(path);
    const owner = ownerOf(dirname(path));
    const places = new Map();
    const note = (line, rule) => {
      if (!places.has(line)) places.set(line, rule);
    };
    if (library && library.includes(sha256(bytes))) note(1, "copy");
    const lines = bytes.toString("utf8").split(/\r?\n/);
    lines.forEach((text, i) => {
      if (ALGORITHM[0].test(text) && (ALGORITHM[1].test(text) || lines.slice(i + 1, i + 4).some((next) => ALGORITHM[1].test(next)))) note(i + 1, "implementation");
      if (PLATFORM.some((p) => p.test(text))) note(i + 1, "crypto");
    });
    for (const [line, rule] of [...places].sort((a, b) => a[0] - b[0])) {
      findings.push({ id: `kaal-foundation/${file}:${line}`, rule, file, line, digest: sha256(new TextEncoder().encode(lines[line - 1])), owner });
    }
  };

  const walk = (dir) => {
    if (ownerOf(dir) === OWNER) {
      skipped.push({ path: rel(dir), reason: "owner" });
      return;
    }
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    } catch {
      unreadable.push({ path: rel(dir), cause: "unreadable" });
      return;
    }
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isSymbolicLink()) skipped.push({ path: rel(path), reason: "link" });
      else if (entry.isDirectory()) {
        if (NOT_WALKED.has(entry.name)) skipped.push({ path: rel(path), reason: entry.name });
        else walk(path);
      } else if (entry.isFile() && SOURCE.test(entry.name)) scanFile(path);
    }
  };

  for (const target of targets) {
    const path = resolve(base, target);
    let stat;
    try {
      stat = lstatSync(path);
    } catch {
      unreadable.push({ path: rel(path), cause: "unreadable" });
      continue;
    }
    if (stat.isDirectory()) walk(path);
    else if (stat.isFile()) {
      if (ownerOf(dirname(path)) === OWNER) skipped.push({ path: rel(path), reason: "owner" });
      else scanFile(path);
    } else skipped.push({ path: rel(path), reason: "not a file" });
  }

  const complete = unreadable.length === 0 && read > 0;
  const coverage = { read, unreadable, skipped };
  console.log(
    `${LINE}: ${findings.length} finding(s) in ${read} source file(s) read; ${unreadable.length} unreadable, ${skipped.length} skipped. ` +
      (complete ? (findings.length ? "A finding is a place to look at, not a fault." : "None found within this coverage.") : "Unknown: not every target was read."),
  );
  finish({ mode: "scan", result: complete ? "complete" : "unknown", coverage, findings }, complete ? 0 : 2);
}
