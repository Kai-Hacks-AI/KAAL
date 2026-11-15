// test:embedded (foundation/F12, foundation/A9): the consumer's verification of the installed copy.
// It checks every file test/verify.json lists with the host's SHA-256, never Foundation's own lib/, so
// a broken library cannot hide itself (foundation/N10, testing/N12). It then runs the delivered cases
// in test/embed/ and matches them, by name, against the manifest's cases. Its last line is
// `kaal-foundation-verification {json}` with the result, the exit status, each executed case and the
// causes (testing/C29). verified (0), failed (1) or cannot verify (2), whose meanings are Testing's.
// It imports only Node's built-in modules, writes nothing, and makes no platform decision (foundation/N7).
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { run } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LINE = "kaal-foundation-verification";
const EXIT = { verified: 0, failed: 1, "cannot verify": 2 };
const causes = [];

function finish(result, cases = []) {
  for (const c of cases) console.log(`${c.outcome}: ${c.name}`);
  for (const c of causes) console.log(`${result}: ${c}`);
  console.log(`${LINE} ${JSON.stringify({ result, exit: EXIT[result], cases, causes })}`);
  process.exit(EXIT[result]);
}

let pkg = {};
try {
  pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
} catch {
  // package.json is a listed file: the manifest check below names it.
}
console.log(`kaal-foundation verification: ${pkg.name ?? "?"}@${pkg.version ?? "?"}, this copy only`);

// The manifest (foundation/F11). Missing or malformed, nothing can be told apart: cannot verify.
let manifest;
try {
  manifest = JSON.parse(readFileSync(join(ROOT, "test", "verify.json"), "utf8"));
} catch (e) {
  causes.push(`test/verify.json cannot be read: ${e?.code ?? e?.message ?? e}`);
  finish("cannot verify");
}
const files = manifest?.files;
const declared = manifest?.cases;
if (files === null || typeof files !== "object" || Array.isArray(files)) causes.push("test/verify.json lists no files");
if (!Array.isArray(declared) || declared.length === 0 || !declared.every((c) => typeof c === "string" && c !== "")) causes.push("test/verify.json declares no cases");
if (causes.length) finish("cannot verify");

// Every listed file, against the host's SHA-256. A difference is cannot verify, never failed (testing/F43).
for (const [path, digest] of Object.entries(files)) {
  let bytes;
  try {
    bytes = readFileSync(join(ROOT, path));
  } catch {
    causes.push(`${path} is missing`);
    continue;
  }
  if (createHash("sha256").update(bytes).digest("hex") !== digest) causes.push(`${path} differs from test/verify.json`);
}
if (causes.length) finish("cannot verify");

// Foundation's approved shipped interface (foundation/F5), fixed here and never read from the
// candidate's own package.json. Imported by its package specifier, as a consumer would. One that cannot
// be imported, or lacks its export, cannot be exercised: cannot verify, not failed.
const REQUIRED = { "@kaihacksai/kaal-foundation/sha256": ["sha256"] };
for (const [specifier, names] of Object.entries(REQUIRED)) {
  let m;
  try {
    m = await import(specifier);
  } catch (e) {
    causes.push(`${specifier} cannot be imported: ${e?.code ?? e?.message ?? e}`);
    continue;
  }
  for (const name of names) if (typeof m[name] !== "function") causes.push(`${specifier} exports no ${name}`);
}
if (causes.length) finish("cannot verify");

// The delivered cases. Clear NODE_TEST_CONTEXT, or a run inside node --test reports to the outer
// runner and runs nothing here.
const dir = join(ROOT, "test", "embed");
let caseFiles = [];
try {
  caseFiles = readdirSync(dir).filter((f) => f.endsWith(".test.mjs")).sort().map((f) => join(dir, f));
} catch {
  // No directory: no case file, said below.
}
if (caseFiles.length === 0) {
  causes.push("test/embed/ holds no case file");
  finish("cannot verify");
}
delete process.env.NODE_TEST_CONTEXT;
const executed = [];
const failures = [];
for await (const event of run({ files: caseFiles })) {
  if (event.type !== "test:pass" && event.type !== "test:fail") continue;
  const d = event.data;
  if (d.details?.type === "suite") continue;
  const name = /^([a-z][a-z-]*\/T\d+) \[/.exec(d.name)?.[1] ?? d.name;
  const outcome = event.type === "test:fail" ? "fail" : d.skip ? "skip" : d.todo ? "todo" : "pass";
  executed.push({ name, outcome });
  if (outcome === "fail") failures.push(`${name} failed: ${String(d.details?.error?.cause?.message ?? d.details?.error?.message ?? "no message").split("\n")[0]}`);
}

// Exactly the declared cases, each once (foundation/F12).
const known = new Set(declared);
const seen = new Map();
for (const { name } of executed) seen.set(name, (seen.get(name) ?? 0) + 1);
const missing = declared.filter((n) => !seen.has(n));
const undeclared = [...seen.keys()].filter((n) => !known.has(n));
const twice = [...seen].filter(([, n]) => n > 1).map(([name, n]) => `${name} (${n} times)`);
const unrun = executed.filter((c) => known.has(c.name) && c.outcome !== "pass" && c.outcome !== "fail").map((c) => `${c.name} (${c.outcome})`);
if (missing.length) causes.push(`declared cases did not run: ${missing.join(", ")}`);
if (undeclared.length) causes.push(`cases ran that test/verify.json does not declare: ${undeclared.join(", ")}`);
if (twice.length) causes.push(`cases ran more than once: ${twice.join(", ")}`);
if (unrun.length) causes.push(`declared cases did not execute: ${unrun.join(", ")}`);
if (causes.length) {
  causes.push(...failures);
  finish("cannot verify", executed);
}
if (failures.length) {
  causes.push(...failures);
  finish("failed", executed);
}
finish("verified", executed);
