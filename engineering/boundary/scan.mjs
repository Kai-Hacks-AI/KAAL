// The Boundary Engine's evidence: runs a definition's tests over targets and reports findings and coverage.
// It reads files and nothing else: it never imports, runs or writes a target (engineering/boundary/PLAN.md R1, R3).
// A finding is a place, reported once, attributed to the first test of the definition that matches it.
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
import { DETECTORS } from "./detectors/index.mjs";
import { parseSource } from "./parse.mjs";
import { GLOBAL_LIST, reasonFor } from "./scope.mjs";

const NOT_WALKED = new Set(["node_modules", ".git"]);
const OWNERSHIP = "ownership.kaal.json";

/** Runs one definition over the targets. Returns { findings, read: Set<file>, unreadable, skipped, notApplicable }. */
export function scanDefinition(definition, targets, base) {
  const rel = (path) => relative(base, path).split(sep).join("/") || ".";
  const unreadable = [];
  const skipped = [];
  const notApplicable = [];
  const findings = [];
  const read = new Set();
  const reasons = reasonFor(GLOBAL_LIST, definition.notApplicable ?? []);
  const prepared = definition.tests.map((test) => {
    const detector = DETECTORS.get(test.detector);
    const state = detector.prepare(test, { dir: definition.dir });
    unreadable.push(...state.unreadable);
    return { test, detector, state };
  });

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
    const file = rel(path);
    const text = bytes.toString("utf8");
    const lines = text.split(/\r?\n/);
    const parsed = parseSource(file, text);
    const structural = prepared.filter(({ detector }) => detector.needsParse);
    if (parsed.kind === "none" && structural.length > 0) {
      // No parser for this kind: the code detectors do not apply. Recorded with a reason, never counted as read or as clean.
      notApplicable.push({ path: file, detectors: structural.map(({ test }) => test.id), reason: reasons(path) });
    } else read.add(file);
    if (parsed.kind === "error") unreadable.push({ path: file, cause: "does not parse" });
    const subject = { digest: sha256(bytes), lines, sources: parsed.sources };
    const owner = ownerOf(dirname(path));
    const places = new Map();
    for (const { test, detector, state } of prepared) {
      for (const line of detector.detect(test, state, subject)) if (!places.has(line)) places.set(line, test.id);
    }
    for (const [line, rule] of [...places].sort((a, b) => a[0] - b[0])) {
      findings.push({ id: `${definition.provider}/${file}:${line}`, rule, file, line, digest: sha256(new TextEncoder().encode(lines[line - 1])), owner });
    }
  };

  const walk = (dir) => {
    if (ownerOf(dir) === definition.provider) {
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
      } else if (entry.isFile()) scanFile(path);
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
      if (ownerOf(dirname(path)) === definition.provider) skipped.push({ path: rel(path), reason: "owner" });
      else scanFile(path);
    } else skipped.push({ path: rel(path), reason: "not a file" });
  }
  return { findings, read, unreadable, skipped, notApplicable };
}

/** The evidence of several definitions over the same targets: findings, coverage and whether it is complete. */
export function scan(definitions, targets, base) {
  const root = resolve(base ?? process.cwd());
  const read = new Set();
  const unreadable = [];
  const skipped = [];
  const notApplicable = [];
  const findings = [];
  const seen = (list, item) => list.some((x) => x.path === item.path && x.reason === item.reason && x.cause === item.cause);
  for (const definition of definitions) {
    const part = scanDefinition(definition, targets, root);
    part.read.forEach((f) => read.add(f));
    for (const item of part.unreadable) if (!seen(unreadable, item)) unreadable.push(item);
    for (const item of part.skipped) if (!seen(skipped, item)) skipped.push(item);
    for (const item of part.notApplicable) if (!notApplicable.some((x) => x.path === item.path && x.reason === item.reason)) notApplicable.push(item);
    findings.push(...part.findings);
  }
  const complete = unreadable.length === 0 && read.size > 0;
  return { mode: "scan", result: complete ? "complete" : "unknown", coverage: { read: read.size, unreadable, skipped, notApplicable }, findings };
}
