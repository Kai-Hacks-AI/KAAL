#!/usr/bin/env node
// kaal-core's consumer verification (core/F70, core/F85, core/F87, core/N23, core/A43).
// It first checks the package's files against the shipped manifest, test/verify.json, which only
// establishes the candidate. It then runs the delivered loops and reports Testing's result for this
// candidate: verified only when every required case executed successfully. One execution record
// precedes the result line, which is the last line of standard output.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = "test/verify.json";
const RESULTS = { verified: 0, failed: 1, "cannot verify": 2 };

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
let pkg = {};
try {
  pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
} catch {
  // An unreadable package.json is reported by the consistency check below.
}
const candidate = { name: pkg.name, version: pkg.version, manifest: null };
let cases = [];
let outcomes = new Map();

/** Prints the execution record and the result line, then exits with the result's status. */
const end = (result, cause) => {
  const executed = cases.filter((c) => ["passed", "failed"].includes(outcomes.get(c.name))).length;
  {
    const record = { candidate, cases: cases.map((c) => ({ file: c.file, name: c.name, outcome: outcomes.get(c.name) ?? "not run" })) };
    console.log(`kaal-core-execution: ${JSON.stringify(record)}`);
  }
  console.log(`kaal-core: ${result}: ${candidate.name}@${candidate.version}: ${cases.length} declared, ${executed} executed${cause ? `: ${cause}` : ""}`);
  process.exit(RESULTS[result]);
};

/** True when the package directory's real path sits directly in a node_modules directory (core/A34). */
const installed = (() => {
  const parent = dirname(realpathSync(ROOT));
  return basename(parent) === "node_modules" || (basename(parent).startsWith("@") && basename(dirname(parent)) === "node_modules");
})();

/** Every file of the package outside a nested node_modules, as sorted POSIX paths. */
const files = (dir = ROOT, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules") continue;
    const path = join(dir, e.name);
    if (e.isDirectory()) files(path, out);
    else out.push(path.slice(ROOT.length + 1).replaceAll("\\", "/"));
  }
  return out.sort();
};

// The candidate and its consistency with the manifest.
let manifest;
try {
  const bytes = readFileSync(join(ROOT, MANIFEST));
  manifest = JSON.parse(bytes.toString("utf8"));
  candidate.manifest = sha256(bytes);
} catch {
  end("cannot verify", `${MANIFEST} is missing or unreadable`);
}
cases = Array.isArray(manifest.cases) ? manifest.cases : [];
const listed = manifest.files && typeof manifest.files === "object" ? manifest.files : {};
const present = files().filter((path) => path !== MANIFEST);
for (const path of Object.keys(listed).sort()) {
  if (!present.includes(path)) end("cannot verify", `${path} is missing`);
  if (sha256(readFileSync(join(ROOT, path))) !== listed[path]) end("cannot verify", `${path} does not match the manifest`);
}
if (installed) for (const path of present) if (!(path in listed)) end("cannot verify", `${path} is not in the manifest`);
if (cases.length === 0) end("cannot verify", "no case is declared");

// Run the delivered loops in a scratch directory, reading each case's outcome from TAP.
const scratch = mkdtempSync(join(tmpdir(), "kaal-core-verify-"));
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
let run;
try {
  const loops = [...new Set(cases.map((c) => c.file))].map((file) => join(ROOT, file));
  run = spawnSync(process.execPath, ["--test", "--test-reporter=tap", ...loops], { cwd: scratch, env, encoding: "utf8" });
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
const ran = new Map();
const lines = (run.stdout ?? "").split(/\r?\n/);
const stack = [];
for (let i = 0; i < lines.length; i++) {
  const subtest = /^( *)# Subtest: (.*)$/.exec(lines[i]);
  if (subtest) {
    const depth = subtest[1].length / 4;
    stack.length = depth;
    stack[depth] = subtest[2];
    continue;
  }
  const point = /^( *)(not ok|ok) \d+ - .*?(?: # (SKIP|TODO)\b.*)?$/i.exec(lines[i]);
  if (!point) continue;
  const depth = point[1].length / 4;
  let suite = false;
  for (let j = i + 1; j < lines.length && /^ *(---|\.\.\.|[\w]+:|  )/.test(lines[j]); j++) if (/type: 'suite'/.test(lines[j])) suite = true;
  if (suite) continue;
  const name = stack.slice(0, depth + 1).join(" > ");
  ran.set(name, point[3] ? point[3].toLowerCase() === "skip" ? "skipped" : "todo" : point[2] === "ok" ? "passed" : "failed");
}
outcomes = ran;

// Testing's result for this candidate: every required case must have executed successfully.
const declared = new Set(cases.map((c) => c.name));
for (const c of cases) {
  const outcome = ran.get(c.name);
  if (outcome === undefined) end("cannot verify", `${c.name} did not run`);
  if (outcome === "skipped" || outcome === "todo") end("cannot verify", `${c.name} was ${outcome === "skipped" ? "skipped" : "marked todo"}`);
}
for (const name of ran.keys()) if (!declared.has(name)) end("cannot verify", `${name} ran but is not declared`);
const failing = cases.find((c) => ran.get(c.name) === "failed");
if (failing) end("failed", `${failing.name} failed`);
end("verified");
