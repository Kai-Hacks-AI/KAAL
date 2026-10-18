#!/usr/bin/env node
// Contract evidence: for each capability's own mapping (evidence.kaal.json,
// beside its ownership claim), what this tree and one run's captured evidence
// show about each statement it pins. Testing reads and classifies
// (kaal-testing/contracts); this driver only finds the mappings among the
// tracked files and reads, through Hosting, the bytes they pin.
//
// Usage: measure.mjs [--json] [--coverage <captures>]
// No test runs here. Per-test results are taken only from the captured
// evidence of the run, under --coverage (lanes/evidence.mjs), from a capture's
// `perTest` records. The lanes do not capture per-test results yet, so every
// offered test is unknown, with that reason: a gap shown, never filled by
// running the tests again. Findings are reported, not gated: the exit status
// is non-zero only when the mappings cannot be found.
import { join, resolve } from "node:path";
import { execute, kind, read, readFile } from "kaal-hosting";
import { classify, problems } from "kaal-testing/contracts";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const json = args.includes("--json");
const at = args.indexOf("--coverage");
if (at >= 0 && (!args[at + 1] || args[at + 1].startsWith("--"))) {
  console.error("usage: measure.mjs [--json] [--coverage <captures>]");
  process.exit(2);
}
const captures = at >= 0 ? resolve(args[at + 1]) : undefined;

const listed = await execute("git", ["ls-files", "-z"], { cwd: ROOT });
if (listed.status !== 0) {
  process.stderr.write(listed.stderr);
  console.error("contracts: listing the tracked files failed");
  process.exit(1);
}
const mappings = listed.stdout.split("\0").filter((p) => p === "evidence.kaal.json" || p.endsWith("/evidence.kaal.json")).sort();

/** This tree's bytes at a repository path, or undefined when there is no such file. */
async function bytes(path) {
  const full = join(ROOT, path);
  return (await kind(full)) === "file" ? readFile(full) : undefined;
}

/** The run's per-test results from its captures, or undefined when they carry none. */
async function perTest() {
  if (captures === undefined) return undefined;
  const records = [];
  for (const [path, b] of Object.entries(await read(captures))) {
    if (!path.endsWith("/capture.json")) continue;
    const capture = JSON.parse(b.toString("utf8"));
    if (!Array.isArray(capture.perTest)) return undefined;
    records.push(...capture.perTest);
  }
  return records.length ? records : undefined;
}

const results = await perTest();
const report = [];
for (const path of mappings) {
  const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/") + 1) : "";
  const claimBytes = await bytes(`${dir}ownership.kaal.json`);
  let mapping;
  let owner;
  try {
    mapping = JSON.parse((await bytes(path)).toString("utf8"));
    owner = claimBytes === undefined ? undefined : JSON.parse(claimBytes.toString("utf8")).owner;
  } catch (e) {
    report.push({ mapping: path, problems: [`does not read as JSON (${e.message})`] });
    continue;
  }
  const found = problems(mapping, owner);
  if (found.length) {
    report.push({ mapping: path, problems: found });
    continue;
  }
  const files = {};
  for (const p of new Set(mapping.statements.flatMap((s) => [s.source, ...s.evidence.map((e) => e.file)]))) {
    const b = await bytes(p);
    if (b !== undefined) files[p] = b;
  }
  report.push({ mapping: path, owner: mapping.owner, statements: await classify(mapping, files, results) });
}

if (json) {
  console.log(JSON.stringify({ perTestResults: results !== undefined, mappings: report }, null, 2));
  process.exit(0);
}
console.log(results === undefined ? "per-test results: none in this run's evidence, so every offered test is unknown" : `per-test results: ${results.length} from this run's evidence`);
for (const m of report) {
  console.log("");
  if (m.problems) {
    console.log(`${m.mapping}: verified failure: the mapping does not read`);
    for (const p of m.problems) console.log(`  ${p}`);
    continue;
  }
  console.log(`${m.mapping}: ${m.owner.kind} ${m.owner.name} (${m.owner.id.slice(0, 12)})`);
  for (const s of m.statements) {
    console.log(`- [${s.class}] ${s.loop}: "${s.quote}" (${s.source})`);
    console.log(`  ${s.reason}`);
    for (const e of s.evidence) console.log(`  ${e.class}: ${e.test.join(" > ")} (${e.file}): ${e.reason}`);
    if (s.inference) console.log(`  inference (${s.inference}): ${s.argument} Limits: ${s.limits}`);
  }
}
console.log("");
console.log("scope: a statement is never reported as met; at most its offered tests are verified in this run and the inference that they bear on it is validated at review, within its limits");
