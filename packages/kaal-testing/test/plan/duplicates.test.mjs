// testing/C50 planned outer tests: in one execution, each Case runs at most once against one subject under one set
// of conditions. Testing finds what an execution ran more than once, and plans an execution so that each distinct
// case file runs once and every requester reads that run. Immutable to DO and CHECK; testing/C51 turns them GREEN.
// Each title names the contracts it checks (plan/duplicates/*.md). Runs and requests are given as plain data, as a
// harness observed or intends them: Testing runs nothing and reads no clock to judge them.
import assert from "node:assert/strict";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

/** kaal-testing/duplicates, or the reason the tests are blocked before any behavioural assertion. */
async function dedup() {
  let m;
  try {
    m = await import("kaal-testing/duplicates");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./duplicates (${e.code ?? e.message})`);
  }
  for (const f of ["duplicates", "schedule"]) if (typeof m[f] !== "function") assert.fail(`blocked before behavioural assertion: kaal-testing/duplicates exports no ${f}`);
  return m;
}

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const hex = (c) => c.repeat(64);
const SUBJECT = hex("a");
const OTHER = hex("b");
const FILE = { path: "test/embed/intent.test.mjs", sha256: hex("1") };
const CODE = { path: "test/embed/code.test.mjs", sha256: hex("2") };
const on = { subject: SUBJECT, platform: "win32", node: "v24.0.0" };
const ran = (name, file, ms, extra = {}) => ({ case: name, file: file.path, sha256: file.sha256, ...on, ms, ...extra });

describe("No case runs twice in one execution (testing/C50)", () => {
  it("testing/T104 [testing/F89]: a run is the same run only for the same Case, the same file bytes, the same subject and the same conditions", async () => {
    const { duplicates } = await dedup();
    const once = ran("guard/T2", FILE, 100);
    assert.equal(duplicates({ runs: [once, { ...once }] }).result, "challenged", "the same Case on the same bytes, subject and conditions, twice, is a duplicate");
    for (const [why, other] of [
      ["another subject", { ...once, subject: OTHER }],
      ["changed file bytes", { ...once, sha256: hex("3") }],
      ["another file", { ...once, file: CODE.path }],
      ["another platform", { ...once, platform: "linux" }],
      ["another Node", { ...once, node: "v24.1.0" }],
      ["another Case", { ...once, case: "guard/T3" }],
    ]) {
      const d = duplicates({ runs: [once, other] });
      assert.equal(d.result, "unchallenged", `${why} is its own evidence, never a duplicate`);
      assert.deepEqual(d.challenges, []);
    }
  });

  it("testing/T105 [testing/F90]: an execution that runs a Case more than once is challenged, naming the Case, how often it ran, who re-ran it and the time spent beyond one run", async () => {
    const { duplicates } = await dedup();
    // Guard's package.test.mjs in miniature: the delivered suite run directly, then again by guard/T101 twice and by guard/T98.
    const direct = [ran("guard/T2", FILE, 2000), ran("guard/T7", CODE, 500)];
    const nested = (by, ms) => [ran("guard/T2", FILE, ms, { by }), ran("guard/T7", CODE, 400, { by })];
    const execution = { runs: [...direct, ...nested("guard/T101", 2100), ...nested("guard/T101", 2500), ...nested("guard/T98", 1900), ran("guard/T101", { path: "engineering/guard/acceptance/package.test.mjs", sha256: hex("9") }, 9000)] };
    const d = duplicates(execution);
    assert.equal(d.result, "challenged");
    assert.deepEqual(d.findings, []);
    assert.deepEqual(d.challenges.map((c) => [c.case, c.file, c.runs, c.wastedMs, c.by]), [
      ["guard/T2", FILE.path, 4, 2000 + 2100 + 2500, ["guard/T101", "guard/T98"]],
      ["guard/T7", CODE.path, 4, 400 + 400 + 500, ["guard/T101", "guard/T98"]],
    ], "each duplicated Case once, slowest waste first; the time beyond one run is all but its fastest run");
    assert.equal(d.wastedMs, 6600 + 1300, "the execution's whole waste");
    for (const c of d.challenges) {
      assert.equal(c.kind, "duplicate");
      assert.equal(c.platform, "win32");
      assert.match(c.statement, new RegExp(`${c.case} ran 4 times`));
      assert.match(c.statement, /guard\/T101, guard\/T98/, "the statement names who re-ran it");
      assert.match(c.next, /guard\/T101, guard\/T98/);
    }
    const direct2 = duplicates({ runs: [ran("acme/T1", FILE, 10), ran("acme/T1", FILE, 30)] }).challenges[0];
    assert.deepEqual(direct2.by, [], "a Case run twice directly is re-run by no Case");
    assert.equal(direct2.wastedMs, 30, "one run is kept, the fastest, and the rest is the waste");
    assert.match(direct2.next, /test\/embed\/intent\.test\.mjs once/);
    assert.equal(duplicates({ runs: direct }).result, "unchallenged", "an execution that runs each Case once is not challenged");
    for (const bad of [undefined, null, {}, { runs: "x" }, { runs: [] }, { runs: [{ ...direct[0], case: "" }] }, { runs: [{ ...direct[0], sha256: "x" }] }, { runs: [{ ...direct[0], subject: "candidate" }] },
      { runs: [{ ...direct[0], ms: -1 }] }, { runs: [{ ...direct[0], ms: Infinity }] }, { runs: [{ ...direct[0], platform: undefined }] }, { runs: [{ ...direct[0], node: 24 }] }, { runs: [{ ...direct[0], by: "" }] }, { runs: [null] }]) {
      const u = duplicates(bad);
      assert.equal(u.result, "unknown", `an execution that cannot be read is unknown, never unchallenged: ${JSON.stringify(bad)}`);
      assert.ok(u.findings.length > 0);
      assert.deepEqual(u.challenges, []);
    }
  });

  it("testing/T106 [testing/F91]: an execution is planned so each distinct case file runs once, and every request reads that one run", async () => {
    const { schedule } = await dedup();
    const suite = [FILE, CODE];
    const s = schedule([{ by: "guard/T101", files: suite, ...on }, { by: "guard/T98", files: suite, ...on }, { by: "guard/T109", files: [FILE], ...on }]);
    assert.deepEqual(s.findings, []);
    assert.deepEqual(s.runs, [
      { file: CODE.path, sha256: CODE.sha256, ...on, for: ["guard/T101", "guard/T98"] },
      { file: FILE.path, sha256: FILE.sha256, ...on, for: ["guard/T101", "guard/T109", "guard/T98"] },
    ], "three requests of the same files give two runs, each read by every request that asked for it");
    assert.deepEqual(s.reads, [
      { by: "guard/T101", file: CODE.path, run: 0 }, { by: "guard/T101", file: FILE.path, run: 1 },
      { by: "guard/T109", file: FILE.path, run: 1 },
      { by: "guard/T98", file: CODE.path, run: 0 }, { by: "guard/T98", file: FILE.path, run: 1 },
    ], "each request reads the one run of each file it asked for");
    const twice = schedule([{ by: "a", files: [FILE, FILE], ...on }]);
    assert.deepEqual([twice.runs.length, twice.runs[0].for, twice.reads.length], [1, ["a"], 1], "a file asked for twice by one request runs once, and is read once");
    const apart = schedule([{ by: "a", files: [FILE], ...on }, { by: "b", files: [{ ...FILE, sha256: hex("3") }], ...on }, { by: "c", files: [FILE], ...on, subject: OTHER }, { by: "d", files: [FILE], ...on, platform: "linux" }]);
    assert.equal(apart.runs.length, 4, "other bytes, another subject or other conditions are other runs");
    for (const bad of [undefined, "x", [{ by: "a", files: [], ...on }], [{ by: "a", files: [FILE], ...on }, { by: "a", files: [CODE], ...on }], [{ files: [FILE], ...on }], [{ by: "a", files: [{ path: FILE.path }], ...on }], [{ by: "a", files: [FILE], ...on, subject: "x" }], [{ by: "a", files: [FILE], ...on, node: undefined }], [null]]) {
      const u = schedule(bad);
      assert.ok(u.findings.length > 0, `a request that cannot be read is a finding: ${JSON.stringify(bad)}`);
      assert.deepEqual(u.runs, [], "and nothing is planned from it");
      assert.deepEqual(u.reads, []);
    }
  });

  it("testing/T107 [testing/F92]: a duplicate is evidence for the case owner, never a result, and running a failed Case again in the same execution is a duplicate too", async () => {
    const { duplicates } = await dedup();
    const runs = [ran("acme/T1", FILE, 50, { outcome: "fail" }), ran("acme/T1", FILE, 50, { outcome: "pass" })];
    const given = structuredClone(runs);
    const d = duplicates({ runs });
    assert.equal(d.result, "challenged", "a retry to green is a duplicate run, never a new result");
    assert.ok(["challenged", "unchallenged", "unknown"].includes(d.result));
    for (const word of ["failed", "verified", "passed"]) assert.notEqual(d.result, word);
    assert.deepEqual(d.challenges.map((c) => c.owner), ["case owner"], "the case owner acts on a duplicate");
    assert.ok(!("outcome" in d.challenges[0]) && !("outcomes" in d.challenges[0]), "a challenge states no outcome: which run's result stands is the run's own, never the duplicate's");
    assert.deepEqual(runs, given, "the runs given are not changed");
  });

  it("testing/T108 [testing/N19]: finding and planning are pure and deterministic: the same runs or requests give the same result, whatever order they came in", async () => {
    const { duplicates, schedule } = await dedup();
    const runs = [ran("b/T1", CODE, 5, { by: "z/T9" }), ran("a/T1", FILE, 5), ran("b/T1", CODE, 7, { by: "m/T9" }), ran("a/T1", FILE, 7), ran("c/T1", FILE, 1)];
    assert.deepEqual(duplicates({ runs: [...runs].reverse() }), duplicates({ runs }));
    assert.deepEqual(duplicates({ runs }).challenges.map((c) => c.case), ["a/T1", "b/T1"], "equal waste is ordered by Case");
    assert.deepEqual(duplicates({ runs }).challenges[1].by, ["m/T9", "z/T9"], "who re-ran a Case is named in order");
    const requests = [{ by: "z", files: [FILE, CODE], ...on }, { by: "m", files: [CODE], ...on }];
    assert.deepEqual(schedule([...requests].reverse()), schedule(requests));
    const before = structuredClone(requests);
    schedule(requests);
    assert.deepEqual(requests, before, "the requests given are not changed");
    const malformed = [{ by: "", files: [], ...on }, { by: "x", files: [{}], ...on }];
    assert.deepEqual(schedule([...malformed].reverse()).findings, schedule(malformed).findings, "findings name what is wrong, never where it came in the list");
    const bad = [{ ...runs[0], ms: -1 }, { ...runs[1], sha256: "x" }];
    assert.deepEqual(duplicates({ runs: [...bad].reverse() }).findings, duplicates({ runs: bad }).findings);
  });

  it("testing/T109 [testing/F91, testing/F62]: Testing's own npm test runs each of its files once: no case file is in two of its test scripts, nor twice in one", async () => {
    const { schedule } = await dedup();
    const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    const sha = (p) => sha256(readFileSync(join(PACKAGE, p)));
    let embed = [];
    try {
      embed = readdirSync(join(PACKAGE, "test/embed")).filter((f) => f.endsWith(".test.mjs")).map((f) => `test/embed/${f}`);
    } catch {
      // no delivered cases yet
    }
    // Each test script is a request: the case files it names, and the delivered cases where it runs the installed verification.
    const requests = Object.entries(pkg.scripts).filter(([name]) => name === "test" || name.startsWith("test:")).map(([name, command]) => {
      const named = command.split(/\s+/).filter((w) => /\.test\.mjs$/.test(w));
      assert.equal(new Set(named).size, named.length, `${name} names each file once`);
      return { by: name, files: [...named, ...(/\btest\/verify\.mjs\b/.test(command) ? embed : [])].map((p) => ({ path: p, sha256: sha(p) })), ...on };
    }).filter((q) => q.files.length > 0);
    assert.ok(requests.length > 0, "npm test runs some case file");
    const s = schedule(requests);
    assert.deepEqual(s.findings, []);
    assert.deepEqual(s.runs.filter((r) => r.for.length > 1).map((r) => `${r.file} in ${r.for.join(" and ")}`), [], "no case file runs in two test scripts");
  });
});
