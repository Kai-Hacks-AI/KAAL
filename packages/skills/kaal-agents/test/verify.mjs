// The consumer's verification of the installed package (agents/F7, agents/A5): Agents' Embedded
// verification, and what the installation's `npm test` will run. It checks the prerequisites, the
// installed files against the shipped manifest (test/verify.json) and the coverage the manifest
// declares, runs every delivered consumer case in a scratch directory it removes, checks that the
// consumer is unchanged, and ends in exactly one result: verified (exit 0), failed (1) or cannot
// verify (2). Its last line is the summary, as JSON after PREFIX. It realizes Testing's
// consumer-verification semantics in Agents' own code, after Guard's, without importing either;
// it imports nothing from lib/, so a broken runtime cannot mask itself, and uses only Node's
// built-ins (agents/N1).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdtempSync, readdirSync, readFileSync, readlinkSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { run } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The copy of the package this entry ships in. */
export const PACKAGE = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), ".."));

/** The shipped manifest, relative to the package: the delivered cases, the coverage, and every other shipped file's SHA-256. */
export const MANIFEST = "test/verify.json";

/** The exit status of each result. */
export const EXIT = { verified: 0, failed: 1, "cannot verify": 2 };

/** The summary line starts with this, and carries the run as JSON. */
export const PREFIX = "kaal-agents-verification ";

/** Files npm ships whatever `files` says. */
const ALWAYS = ["package.json", "README.md", "LICENSE"];

/** An identifier the documents define: an Intent, a Requirement or an Architecture element. */
const DEFINED = /\*\*(agents\/[IFNA]\d+)\b/g;

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const slash = (p) => p.split(sep).join("/");

/** The copy is installed when it sits in a node_modules directory. */
const INSTALLED = PACKAGE.split(sep).includes("node_modules");

/** The consumer's project: the directory holding the node_modules the copy is installed in, or the copy itself. */
export const CONSUMER = INSTALLED ? PACKAGE.split(sep).slice(0, PACKAGE.split(sep).lastIndexOf("node_modules")).join(sep) || sep : PACKAGE;

/** Every file and symbolic link under a directory, by path, skipping .git/ and node_modules/. */
function walk(base) {
  const out = [];
  const go = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name !== "node_modules" && e.name !== ".git") go(p);
      } else if (e.isFile() || e.isSymbolicLink()) out.push(slash(relative(base, p)));
    }
  };
  go(base);
  return out.sort();
}

/**
 * The SHA-256 of every shipped file in the copy, by path, except the manifest itself. In an
 * installation that is every file in the copy outside its own node_modules. Elsewhere, such as a
 * source checkout with its own tests, it is what `files` lists and what npm always ships.
 */
export function hashes(base = PACKAGE, installed = INSTALLED) {
  let paths;
  if (installed) paths = walk(base);
  else {
    const pkg = JSON.parse(readFileSync(join(base, "package.json"), "utf8"));
    paths = [];
    for (const path of [...ALWAYS, ...(pkg.files ?? [])]) {
      const file = join(base, path);
      if (!existsSync(file)) continue;
      if (lstatSync(file).isDirectory()) paths.push(...walk(file).map((f) => slash(join(path, f))));
      else paths.push(slash(path));
    }
  }
  const out = {};
  for (const f of [...new Set(paths)].sort()) if (f !== MANIFEST) out[f] = sha256(readFileSync(join(base, f)));
  return out;
}

/** The digest of the installed files: the SHA-256 of one line `<path>\0<sha256>\n` per file, in path order. */
export const digest = (files) => sha256(Object.keys(files).sort().map((f) => `${f}\0${files[f]}\n`).join(""));

/** What the consumer holds, the copy included and every other node_modules/ and .git/ left out, so a change shows. */
function consumer() {
  const state = {};
  const add = (base, prefix) => {
    for (const f of walk(base)) {
      const p = join(base, f);
      state[prefix + f] = lstatSync(p).isSymbolicLink() ? `-> ${readlinkSync(p)}` : sha256(readFileSync(p));
    }
  };
  add(CONSUMER, "");
  if (CONSUMER !== PACKAGE) add(PACKAGE, `${slash(relative(CONSUMER, PACKAGE))}/`);
  return state;
}

/** The identifiers the copy's documents define, sorted. */
export function defined(base = PACKAGE) {
  const docs = join(base, "docs");
  if (!existsSync(docs)) return [];
  const ids = readdirSync(docs).filter((f) => f.endsWith(".md")).flatMap((f) => [...readFileSync(join(docs, f), "utf8").matchAll(DEFINED)].map((m) => m[1]));
  return [...new Set(ids)].sort();
}

/** A case's name: its file in the package, then each enclosing suite, then the test, joined by " > ". */
export const key = (file, path) => [slash(relative(PACKAGE, file)), ...path].join(" > ");

/**
 * Runs the case files in a scratch directory that is removed afterwards, and accounts for each
 * leaf test by its name, with its outcome: pass, fail, skipped or todo. A file that fails outside
 * any test is a failure under the file's own name.
 */
export async function execute(caseFiles) {
  const scratch = realpathSync(mkdtempSync(join(tmpdir(), "kaal-agents-verify-")));
  const env = { ...process.env, TMPDIR: scratch, TMP: scratch, TEMP: scratch };
  delete env.NODE_TEST_CONTEXT;
  const stacks = new Map();
  const outcomes = [];
  try {
    for await (const e of run({ files: caseFiles, concurrency: true, env })) {
      const d = e.data ?? {};
      if (e.type === "test:start") {
        const stack = stacks.get(d.file) ?? [];
        stack.length = d.nesting;
        stack.push(d.name);
        stacks.set(d.file, stack);
        continue;
      }
      if (e.type !== "test:pass" && e.type !== "test:fail") continue;
      const whole = d.nesting === 0 && d.file && resolve(d.name) === resolve(d.file);
      if (whole && e.type === "test:pass") continue;
      if (!whole && d.details?.type !== "test") continue;
      const name = whole ? key(d.file, []) : key(d.file, [...(stacks.get(d.file) ?? []).slice(0, d.nesting), d.name]);
      const marked = (v) => v !== undefined && v !== false;
      const outcome = marked(d.todo) ? "todo" : marked(d.skip) ? "skipped" : e.type === "test:pass" ? "pass" : "fail";
      const error = d.details?.error;
      outcomes.push({ name, outcome, message: outcome === "fail" ? String(error?.cause?.message ?? error?.message ?? "failed").split(/\r?\n/)[0] : undefined });
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true, maxRetries: 3 });
  }
  return outcomes;
}

/** What must be present before any case can run. */
function prerequisites() {
  const missing = [];
  if (Number(process.versions.node.split(".")[0]) < 24) missing.push(`Node ${process.versions.node} is older than the required 24`);
  if (spawnSync("git", ["--version"], { encoding: "utf8" }).status !== 0) missing.push("git is not on PATH");
  return missing;
}

/** Runs the verification, prints its output with the summary line last, and returns the result. */
export async function main(log = (line) => console.log(line)) {
  // Each cause carries the next step it calls for: precise only where the cause is established and
  // its remedy known, diagnostic where the evidence must be inspected first.
  const failed = [];
  const unknown = [];
  const fail = (cause, kind, step) => failed.push({ cause, next: { kind, step } });
  const cannot = (cause, kind, step) => unknown.push({ cause, next: { kind, step } });
  const reinstall = "reinstall the package, then run the verification again";
  const publisher = "inspect the evidence, and report it to the package's publisher";

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
  } catch (e) {
    cannot(`package.json cannot be read: ${e.message}`, "precise", reinstall);
  }
  log(`kaal-agents verification: ${pkg ? `${pkg.name}@${pkg.version}` : "an unreadable package"}, the installed package only`);
  log(`location: ${PACKAGE}`);
  for (const cause of prerequisites()) cannot(cause, "precise", "install what is missing, then run the verification again");

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(PACKAGE, MANIFEST), "utf8"));
    if (!Array.isArray(manifest.cases) || !manifest.files || typeof manifest.files !== "object" || !manifest.coverage || typeof manifest.coverage !== "object") throw new Error("it lists no cases, coverage and files");
  } catch (e) {
    cannot(`${MANIFEST} cannot be read: ${e.message}`, "precise", reinstall);
    manifest = undefined;
  }

  // Installed bytes that are not the shipped bytes say only that what would be tested is not what
  // shipped: the run cannot verify, and no case is run against them.
  const before = consumer();
  let installed = {};
  if (pkg) installed = hashes();
  if (manifest && pkg) {
    const expected = manifest.files;
    const differ = Object.keys(expected).filter((f) => f in installed && installed[f] !== expected[f]).sort();
    const absent = Object.keys(expected).filter((f) => !(f in installed)).sort();
    const extra = Object.keys(installed).filter((f) => !(f in expected)).sort();
    for (const f of differ) cannot(`an installed file differs from the manifest: ${f}`, "precise", reinstall);
    for (const f of absent) cannot(`a shipped file is missing: ${f}`, "precise", reinstall);
    for (const f of extra) cannot(`a file the manifest does not ship: ${f}`, "precise", reinstall);
    log(`files: ${Object.keys(installed).length} checked, ${differ.length} differ, ${absent.length} missing, ${extra.length} not in the manifest`);
  }

  const cases = [];
  if (manifest && manifest.cases.length === 0) cannot("the manifest declares no cases, and zero cases verify nothing", "diagnostic", publisher);
  else if (manifest && unknown.length === 0) {
    const declared = new Set(manifest.cases);
    const caseFiles = [...new Set(manifest.cases.map((c) => c.split(" > ")[0]))].sort();
    const present = caseFiles.filter((f) => existsSync(join(PACKAGE, f)));
    const outcomes = present.length ? await execute(present.map((f) => join(PACKAGE, f))) : [];
    const seen = new Map();
    for (const o of outcomes) {
      if (caseFiles.includes(o.name)) {
        cannot(`a case file failed outside any case, so its cases did not run: ${o.name}${o.message ? `: ${o.message}` : ""}`, "diagnostic", publisher);
        continue;
      }
      if (!declared.has(o.name)) {
        cannot(`a case ran that the manifest does not declare: ${o.name}`, "diagnostic", publisher);
        continue;
      }
      seen.set(o.name, o.outcome);
      if (o.outcome === "fail") fail(`failed: ${o.name}${o.message ? `: ${o.message}` : ""}`, "diagnostic", "inspect the failing case's message above, and report it to the package's publisher with that message");
      else if (o.outcome !== "pass") cannot(`not executed (${o.outcome}): ${o.name}`, "diagnostic", publisher);
    }
    for (const c of manifest.cases) {
      if (!seen.has(c)) cannot(`a declared case did not run: ${c}`, "diagnostic", publisher);
      cases.push({ name: c, outcome: seen.get(c) ?? "not run" });
    }
    log(`cases: ${manifest.cases.length} declared, ${cases.filter((c) => c.outcome === "pass").length} passed`);
  } else if (manifest) for (const c of manifest.cases) cases.push({ name: c, outcome: "not run" });

  // Coverage: every identifier the installed documents define is covered by delivered cases that
  // passed here, allocated to the publisher, or named as verified by no Test Case (agents/F7).
  const coverage = {};
  if (manifest && pkg) {
    const passed = new Set(cases.filter((c) => c.outcome === "pass").map((c) => c.name));
    for (const id of defined()) {
      const entry = manifest.coverage[id];
      if (!entry || !["covered", "allocated", "unverified"].includes(entry.status) || (entry.status === "covered" && !entry.cases?.length)) {
        cannot(`${id} is defined in docs/, and the manifest declares no coverage for it`, "diagnostic", publisher);
        continue;
      }
      coverage[id] = entry.status === "covered" && !entry.cases.every((c) => passed.has(c)) ? "unverified" : entry.status;
    }
    const by = (s) => Object.keys(coverage).filter((id) => coverage[id] === s);
    log(`coverage: ${by("covered").length} covered here, ${by("allocated").length} allocated to the publisher, ${by("unverified").length} not verified by this run`);
    const not = [...by("allocated"), ...by("unverified")];
    if (not.length) log(`not verified by this run: ${not.join(", ")}`);
  }

  const after = consumer();
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((p) => before[p] !== after[p]).sort();
  for (const p of changed) fail(`the consumer changed during the run: ${p}`, "diagnostic", "inspect the changed path, and report it to the package's publisher");

  for (const { cause } of failed) log(`failed: ${cause}`);
  for (const { cause } of unknown) log(`cannot verify: ${cause}`);
  const result = failed.length ? "failed" : unknown.length ? "cannot verify" : "verified";
  log(result === "verified" ? "verified: every declared case ran and passed against the shipped files" : `${result}: ${failed.length + unknown.length} cause(s) above`);
  const causes = result === "failed" ? failed : unknown;
  const summary = {
    result,
    ...(result === "verified" ? {} : { cause: causes[0].cause, evidence: causes.map((c) => c.cause), next: causes[0].next }),
    package: { name: pkg?.name ?? null, version: pkg?.version ?? null, location: PACKAGE },
    platform: process.platform,
    node: process.versions.node,
    digest: pkg ? digest(installed) : null,
    cases: cases.map(({ name, outcome }) => ({ name, outcome })),
    coverage,
  };
  log(`${PREFIX}${JSON.stringify(summary)}`);
  return result;
}

if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
  process.exitCode = EXIT[await main()];
}
