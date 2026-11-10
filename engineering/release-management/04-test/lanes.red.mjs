// release-management/T22 to T24 (RED): the testing controls' lanes, judged by parsers, never by names (PLAN testing-controls-plan.md,
// step 2). Run by hand from the repository root; no suite or lane names this file until the DO makes it GREEN:
//
//   node --test engineering/release-management/04-test/lanes.red.mjs
//
// Three Cases: (1) every job of the workflow `KAAL` is claimed by a control; (2) a lane or host that is missing, skipped or
// conditional fails the gate unless a FAR Accept names it; (3) a Case file that two lanes both run is declared, with its reason,
// or the lanes are not equivalent duplicates. Do not edit a Case to make it pass.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const LANES = join(ROOT, "engineering", "release-management", "05-src", "lanes");
const workflow = parse(readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8"));
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

/** The `node --test` file arguments of one shell command, with globs expanded (one `*` per path segment). */
function expand(pattern) {
  if (!pattern.includes("*")) return existsSync(join(ROOT, pattern)) ? [pattern] : [];
  const dir = dirname(pattern);
  const escaped = pattern.slice(dir.length + 1).replace(/[\\^$.*+?()[\]{}|]/g, (c) => (c === "*" ? "[^/]*" : `\\${c}`));
  const re = new RegExp(`^${escaped}$`);
  const abs = join(ROOT, dir);
  if (!existsSync(abs) || !statSync(abs).isDirectory()) return [];
  return readdirSync(abs).filter((f) => re.test(f)).map((f) => `${dir}/${f}`);
}
const testFiles = (command) => {
  const m = /node --test (.*)$/.exec(command.trim());
  return m ? m[1].split(/\s+/).flatMap(expand) : [];
};

test("T22 (a) every job of the workflow KAAL is claimed by a control", () => {
  const claimsFile = join(LANES, "claims.json");
  const claims = existsSync(claimsFile) ? JSON.parse(readFileSync(claimsFile, "utf8")) : {};
  const unclaimed = Object.keys(workflow.jobs).filter((id) => !(claims[id] && claims[id].control));
  assert.deepEqual(unclaimed, [], `jobs of ci.yml no control claims (05-src/lanes/claims.json): ${unclaimed.join(", ")}`);
});

test("T23 (b) a lane or host that is missing, skipped or conditional fails the gate unless a FAR Accept names it", async () => {
  const gateFile = join(LANES, "gate.mjs");
  assert.ok(existsSync(gateFile), "05-src/lanes/gate.mjs does not exist: no gate reads the expected lanes and hosts");
  const { judgeLanes } = await import(pathToFileURL(gateFile).href);
  const expected = [{ lane: "Hosting", host: "Windows" }, { lane: "Hosting", host: "Linux" }];
  const ok = { lane: "Hosting", host: "Linux", outcome: "passed" };
  for (const bad of ["skipped", "cancelled", undefined]) {
    const verdict = judgeLanes({ expected, results: [ok, ...(bad ? [{ lane: "Hosting", host: "Windows", outcome: bad }] : [])], accepts: [] });
    assert.equal(verdict.passed, false, `a Windows outcome of ${bad ?? "missing"} must fail`);
  }
  const accepted = judgeLanes({ expected, results: [ok], accepts: [{ lane: "Hosting", host: "Windows", reason: "x", decision: "y" }] });
  assert.equal(accepted.passed, true, "a FAR Accept naming the lane and host is the only door");
});

/** The hosts a job runs on: its literal `runs-on`, or the `os` of each matrix entry. */
const hostsOf = (job) => {
  const os = typeof job["runs-on"] === "string" && !job["runs-on"].includes("${{")
    ? [job["runs-on"]]
    : (job.strategy?.matrix?.include ?? []).map((e) => e.os);
  return os.map((o) => (o.startsWith("windows") ? "Windows" : o.startsWith("macos") ? "macOS" : "Linux"));
};

test("T24 (c) a Case file that two lanes both run on one host is declared with its reason", () => {
  const runs = []; // { file, lane, host }
  for (const [id, job] of Object.entries(workflow.jobs)) {
    for (const step of job.steps ?? []) {
      if (typeof step.run !== "string") continue;
      for (const file of testFiles(step.run)) for (const host of hostsOf(job)) runs.push({ file, lane: id, host });
    }
  }
  // The Engineering lane is `npm run test:engineering`, run by the matrix job `lane` on its host.
  for (const file of testFiles(pkg.scripts["test:engineering"])) for (const host of hostsOf(workflow.jobs.lane)) runs.push({ file, lane: "lane (Engineering)", host });
  const overlaps = new Set();
  for (const a of runs) for (const b of runs) if (a.file === b.file && a.host === b.host && a.lane < b.lane) overlaps.add(`${a.file} on ${a.host}: ${a.lane} and ${b.lane}`);
  const declaredFile = join(LANES, "overlaps.json");
  const declared = existsSync(declaredFile) ? JSON.parse(readFileSync(declaredFile, "utf8")) : {};
  const undeclared = [...overlaps].filter((o) => !declared[o.split(" on ")[0]]?.reason);
  assert.deepEqual(undeclared, [], `Case files run by two lanes on one host without a declared reason: ${undeclared.join("; ")}`);
});
