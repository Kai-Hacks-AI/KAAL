#!/usr/bin/env node
// Contract evidence: for each capability's own mapping (evidence.kaal.json,
// beside its ownership claim), what this tree shows about each statement it
// pins. Testing reads and classifies
// (kaal-testing/contracts); this driver only finds the mappings among the
// tracked files and reads, through Hosting, the bytes they pin. Before reading
// a path it asks Hosting whether the path lies within the repository; a path
// that leads outside, through a link, is never read and is reported unknown
// with that reason. That is Hosting's canonical-path containment, with the
// limits Hosting states: an alias such as a bind mount or hard link is not
// detected, and a link changed between the check and the read is not prevented.
//
// Usage: measure.mjs [--json]
// No test runs here, and no per-test result is read from any file: a result
// record is a claim, not an observation of a run, and no runner execution with
// established provenance supplies one yet. So every offered test is unknown,
// with that reason: a gap shown, never filled by running the tests again or by
// trusting a capture. Findings are reported, not gated: the exit status is
// non-zero only when the mappings cannot be found.
import { join } from "node:path";
import { execute, kind, readFile, within } from "kaal-hosting";
import { classify, problems } from "kaal-testing/contracts";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const json = args.includes("--json");
if (args.some((a) => a !== "--json")) {
  console.error("usage: measure.mjs [--json]");
  process.exit(2);
}

const listed = await execute("git", ["ls-files", "-z"], { cwd: ROOT });
if (listed.status !== 0) {
  process.stderr.write(listed.stderr);
  console.error("contracts: listing the tracked files failed");
  process.exit(1);
}
const mappings = listed.stdout.split("\0").filter((p) => p === "evidence.kaal.json" || p.endsWith("/evidence.kaal.json")).sort();

/** Repository paths that lead outside the repository, so were never read. */
const outside = new Set();
const OUTSIDE = (p) => `${p} leads outside the repository (Hosting: not within); not read`;

/** This tree's bytes at a repository path, or undefined when there is no such file or when the path
 *  leads outside the repository. Containment is Hosting's to judge, never decided here. */
async function bytes(path) {
  const full = join(ROOT, path);
  if ((await kind(full)) !== "file") return undefined;
  if (!(await within(ROOT, full))) {
    outside.add(path);
    return undefined;
  }
  return readFile(full);
}

/** A classified statement, with the reason for each path not read because it leads outside: the
 *  classification still stands as unknown, but "missing" or "stale" would misname why. */
function located(s) {
  const evidence = s.evidence.map((e) => (outside.has(e.file) ? { ...e, class: "unknown", reason: OUTSIDE(e.file) } : e));
  return outside.has(s.source) ? { ...s, class: "unknown", reason: OUTSIDE(s.source), evidence } : { ...s, evidence };
}

const report = [];
for (const path of mappings) {
  const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/") + 1) : "";
  const claimBytes = await bytes(`${dir}ownership.kaal.json`);
  const mappingBytes = await bytes(path);
  const away = [path, `${dir}ownership.kaal.json`].filter((p) => outside.has(p));
  if (away.length) {
    report.push({ mapping: path, problems: away.map(OUTSIDE) });
    continue;
  }
  let mapping;
  let owner;
  try {
    mapping = JSON.parse(mappingBytes.toString("utf8"));
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
  report.push({ mapping: path, owner: mapping.owner, statements: (await classify(mapping, files)).map(located) });
}

if (json) {
  console.log(JSON.stringify({ mappings: report }, null, 2));
  process.exit(0);
}
console.log("per-test results: none accepted, so every offered test is unknown");
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
console.log("scope: a statement is never reported as met; a review the mapping declares is reported as declared, not verified; no per-test result is accepted until one comes from a runner execution with established provenance");
