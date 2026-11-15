#!/usr/bin/env node
// kaal-core's consumer verification (core/F70, core/F85, core/F87, core/N23, core/A43).
// It first checks the package's files against the shipped manifest, test/verify.json, which only
// establishes the candidate. It then runs the delivered loops and reports Testing's result for this
// candidate: verified only when every required case executed successfully. One execution record
// precedes the result line, which is the last line of standard output.
// Every host operation goes through kaal-hosting, KAAL's only OS boundary, except the scratch working
// directory, which Hosting does not offer: it is made and removed with Node's portable calls, never
// by a platform decision. SHA-256 is Foundation's.
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
import { execute, read, readFile } from "@kaihacksai/kaal-hosting";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Node resolves the entry module's links, so this is the package directory's real path.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = "test/verify.json";
const RESULTS = { verified: 0, failed: 1, "cannot verify": 2 };

let pkg = {};
try {
  pkg = JSON.parse((await readFile(join(ROOT, "package.json"))).toString("utf8"));
} catch {
  // An unreadable package.json is reported by the consistency check below.
}
const candidate = { name: pkg.name, version: pkg.version, manifest: null };
let cases = [];
let outcomes = new Map();
const outcomeOf = (c) => outcomes.get(`${c.file}\u0000${c.name}`);

/** Prints the execution record and the result line, then exits with the result's status. */
const end = (result, cause) => {
  const executed = cases.filter((c) => ["passed", "failed"].includes(outcomeOf(c))).length;
  {
    const record = { candidate, cases: cases.map((c) => ({ file: c.file, name: c.name, outcome: outcomeOf(c) ?? "not run" })) };
    console.log(`kaal-core-execution: ${JSON.stringify(record)}`);
  }
  console.log(`kaal-core: ${result}: ${candidate.name}@${candidate.version}: ${cases.length} declared, ${executed} executed${cause ? `: ${cause}` : ""}`);
  process.exit(RESULTS[result]);
};

/** True when the package directory's real path sits directly in a node_modules directory (core/A34). */
const installed = (() => {
  const parent = dirname(ROOT);
  return basename(parent) === "node_modules" || (basename(parent).startsWith("@") && basename(dirname(parent)) === "node_modules");
})();

/** The bytes of a listed file, or undefined when it is missing. */
const bytesOf = async (path) => {
  try {
    return await readFile(join(ROOT, path));
  } catch {
    return undefined;
  }
};

// The candidate and its consistency with the manifest.
let manifest;
try {
  const bytes = await readFile(join(ROOT, MANIFEST));
  manifest = JSON.parse(bytes.toString("utf8"));
  candidate.manifest = sha256(bytes);
} catch {
  end("cannot verify", `${MANIFEST} is missing or unreadable`);
}
cases = Array.isArray(manifest.cases) ? manifest.cases : [];
const listed = manifest.files && typeof manifest.files === "object" ? manifest.files : {};
for (const path of Object.keys(listed).sort()) {
  const bytes = await bytesOf(path);
  if (bytes === undefined) end("cannot verify", `${path} is missing`);
  if (sha256(bytes) !== listed[path]) end("cannot verify", `${path} does not match the manifest`);
}
if (installed) {
  // Only an installation is read whole: a source workspace holds files that do not ship.
  let present;
  try {
    present = Object.keys(await read(ROOT)).filter((path) => path !== MANIFEST && !path.split("/").includes("node_modules")).sort();
  } catch (e) {
    end("cannot verify", `the installed package cannot be read: ${e instanceof Error ? e.message : e}`);
  }
  for (const path of present) if (!(path in listed)) end("cannot verify", `${path} is not in the manifest`);
}
if (cases.length === 0) end("cannot verify", "no case is declared");

// Run each delivered loop on its own in a scratch directory, so every outcome is known by its file
// and its full name, reading the outcomes from TAP.
const scratch = mkdtempSync(join(tmpdir(), "kaal-core-verify-"));
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
const ran = new Map();
const key = (file, name) => `${file}\u0000${name}`;
let incomplete;
let broken;
try {
  for (const file of [...new Set(cases.map((c) => c.file))]) {
    let run;
    try {
      run = await execute(process.execPath, ["--test", "--test-reporter=tap", join(ROOT, file)], { cwd: scratch, env });
    } catch {
      incomplete ??= `the test run of ${file} did not complete`;
      continue;
    }
    let failedHere = false;
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
      // The point's own diagnostic block, and only it, says whether it is a suite.
      let suite = false;
      const indent = `${point[1]}  `;
      if (lines[i + 1] === `${indent}---`) {
        for (let j = i + 2; j < lines.length && lines[j] !== `${indent}...`; j++) if (lines[j] === `${indent}type: 'suite'`) suite = true;
      }
      if (point[2] === "not ok" && !point[3]) failedHere = true;
      if (suite) continue;
      const outcome = point[3] ? (point[3].toLowerCase() === "skip" ? "skipped" : "todo") : point[2] === "ok" ? "passed" : "failed";
      const name = stack.slice(0, depth + 1).join(" > ");
      // A name that runs twice in one file is ambiguous; its worst outcome stands.
      const rank = { failed: 3, skipped: 2, todo: 2, passed: 1 };
      const earlier = ran.get(key(file, name));
      if (!earlier || rank[outcome] > rank[earlier]) ran.set(key(file, name), outcome);
    }
    if (run.status !== 0 && !failedHere) incomplete ??= `the test run of ${file} exited ${run.status} without reporting a failing test`;
    if (failedHere) broken ??= file;
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
outcomes = ran;

// Testing's result for this candidate: every required case must have executed successfully.
const declared = new Set(cases.map((c) => key(c.file, c.name)));
if (incomplete) end("cannot verify", incomplete);
for (const c of cases) {
  const outcome = ran.get(key(c.file, c.name));
  if (outcome === undefined) end("cannot verify", `${c.name} did not run`);
  if (outcome === "skipped" || outcome === "todo") end("cannot verify", `${c.name} was ${outcome === "skipped" ? "skipped" : "marked todo"}`);
}
for (const k of ran.keys()) if (!declared.has(k)) end("cannot verify", `${k.split("\u0000")[1]} ran but is not declared`);
const failing = cases.find((c) => ran.get(key(c.file, c.name)) === "failed");
if (failing) end("failed", `${failing.name} failed`);
if (broken) end("failed", `the test run of ${broken} failed outside a declared case`);
end("verified");
