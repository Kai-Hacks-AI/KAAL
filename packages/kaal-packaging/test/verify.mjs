// test:embedded, the Embedded verification (packaging/F9, packaging/F15). It runs the delivered cases
// in test/embed/ against the copy they ship in, and ends on one line in the shared verifier form
// (packaging/F10, testing/C29): `kaal-packaging-verification {json}` with the result, its exit, each
// execution by case name and outcome, and the causes. Results are Testing's (testing/F13): verified
// (0), failed (1) or cannot verify (2). Zero cases run is never verified.
//
// A case's name is the identifier its title begins with, such as `packaging/T15`. Which cases are
// declared is the shipped manifest's (test/verify.json `cases`, packaging/F11). The run starts
// through Hosting's `execute` (packaging/N11).
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
import { execute } from "kaal-hosting";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NAME = "kaal-packaging";
const EXIT = { verified: 0, failed: 1, "cannot verify": 2 };

function finish(result, cases, causes) {
  console.log(`${NAME}-verification ${JSON.stringify({ result, exit: EXIT[result], cases, causes })}`);
  process.exit(EXIT[result]);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(join(ROOT, "test", "verify.json"), "utf8"));
} catch (e) {
  finish("cannot verify", [], [`the shipped manifest test/verify.json cannot be read: ${e.message}`]);
}
const declared = manifest?.cases;
if (!Array.isArray(declared) || declared.length === 0) finish("cannot verify", [], ["the shipped manifest declares no case"]);
if (new Set(declared).size !== declared.length) finish("cannot verify", [], ["the shipped manifest declares a case more than once"]);

// Integrity preflight (packaging/F11). Every file the manifest lists must be present, a regular file
// inside this package, with the listed SHA-256, before any case runs. Where this copy is installed (it
// carries neither plan/ nor test/publisher/), no file may exist that the manifest does not list. The
// manifest is consistency, not provenance (testing/F14): it detects a changed copy, not a malicious one.
const shipped = manifest.files;
if (shipped === null || typeof shipped !== "object" || Array.isArray(shipped) || Object.keys(shipped).length === 0) {
  finish("cannot verify", [], ["the shipped manifest lists no files"]);
}
const problems = [];
const listed = new Set();
for (const [path, digest] of Object.entries(shipped)) {
  const parts = path.split("/");
  if (path === "" || path.includes("\\") || path.startsWith("/") || parts.some((p) => p === "" || p === "." || p === "..")) {
    problems.push(`${path || "(empty)"}: not a path inside the package`);
    continue;
  }
  listed.add(parts.join(sep));
  const at = join(ROOT, ...parts);
  try {
    if (!lstatSync(at).isFile()) throw new Error("not a regular file");
    if (sha256(readFileSync(at)) !== digest) problems.push(`${path}: changed since the manifest was written`);
  } catch (e) {
    problems.push(`${path}: ${e.message.startsWith("ENOENT") ? "removed" : e.message}`);
  }
}
const installed = !existsSync(join(ROOT, "plan")) && !existsSync(join(ROOT, "test", "publisher"));
if (installed) {
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "node_modules" && dir === ROOT) continue;
      const at = join(dir, e.name);
      if (e.isDirectory()) walk(at);
      else {
        const rel = relative(ROOT, at);
        if (rel !== join("test", "verify.json") && !listed.has(rel)) problems.push(`${rel.split(sep).join("/")}: added, not in the manifest`);
      }
    }
  };
  walk(ROOT);
}
if (problems.length) finish("cannot verify", [], [`the installed files do not match the shipped manifest: ${problems.join("; ")}`]);

const dir = join(ROOT, "test", "embed");
let files = [];
try {
  files = readdirSync(dir).filter((f) => f.endsWith(".test.mjs")).sort().map((f) => join(dir, f));
} catch {
  // No test/embed/: nothing to run, reported below.
}
if (files.length === 0) finish("cannot verify", [], ["no Embedded case ships in test/embed/"]);

// Clear NODE_TEST_CONTEXT, or a run inside node --test reports to the outer runner and counts nothing.
// Pin the TAP reporter, whose `ok` and `not ok` lines name each test.
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
const r = await execute(process.execPath, ["--test", "--test-reporter=tap", ...files], { cwd: ROOT, env });

const cases = [];
for (const m of r.stdout.matchAll(/^\s*(not ok|ok) \d+ - (\S+)(.*)$/gm)) {
  const [, status, first, rest] = m;
  const id = /^(packaging\/T\d+)\b/.exec(first)?.[1];
  if (!id) continue;
  const directive = /#\s*(SKIP|TODO)\b/i.exec(rest)?.[1]?.toLowerCase();
  cases.push({ name: id, outcome: directive ? (directive === "todo" ? "todo" : "not run") : status === "ok" ? "pass" : "fail" });
}

const failed = cases.filter((c) => c.outcome === "fail").map((c) => c.name);
// Exact accounting: each declared case ran exactly once, none undeclared ran, none was skipped or todo.
const count = new Map();
for (const c of cases) count.set(c.name, (count.get(c.name) ?? 0) + 1);
const ran = new Set(cases.filter((c) => c.outcome === "pass" || c.outcome === "fail").map((c) => c.name));
const missing = declared.filter((id) => !ran.has(id));
const duplicated = [...count].filter(([, n]) => n > 1).map(([id]) => id);
const undeclared = [...count.keys()].filter((id) => !declared.includes(id));
const unexecuted = cases.filter((c) => c.outcome === "todo" || c.outcome === "not run").map((c) => c.name);
if (failed.length || r.status !== 0) {
  process.stdout.write(r.stdout);
  process.stderr.write(r.stderr);
  const causes = failed.length ? [`cases failed: ${failed.join(", ")}`] : [`node --test exited ${r.status} with no case failed`];
  finish("failed", cases, causes);
}
if (ran.size === 0) finish("cannot verify", cases, ["no declared case ran"]);
const unknown = [];
if (missing.length) unknown.push(`declared cases did not run: ${missing.join(", ")}`);
if (duplicated.length) unknown.push(`cases ran more than once: ${duplicated.join(", ")}`);
if (undeclared.length) unknown.push(`cases ran that the manifest does not declare: ${undeclared.join(", ")}`);
if (unexecuted.length) unknown.push(`cases were skipped or todo: ${unexecuted.join(", ")}`);
if (unknown.length) finish("cannot verify", cases, unknown);
console.log(`${cases.length} passed`);
finish("verified", cases, []);
