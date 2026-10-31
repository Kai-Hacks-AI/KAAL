// Guard outer acceptance, Engineering part: guard/T134 and guard/T137 (guard/C129, revision 3). Guard's
// tests are placed by the realization they verify, Engineering, Embedded or External, each with its own
// Test Plan. guard/T134 checks, from the workflows, that every declared suite is scheduled by some lane:
// scheduling evidence only. guard/T137 checks what executed: the run record suites.mjs writes from the
// test runner's own report, and the release gate over one record per host. The negative fixtures are
// small repositories built in a scratch directory, each with one fault; the check must name it.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { audit, execute, gate, validate } from "../suites.mjs";

const scratch = [];
after(() => scratch.forEach((d) => rmSync(d, { recursive: true, force: true })));

const suites = (...rows) => ["<!-- suites -->", "| Suite | Owner | Files | Prerequisites |", "| --- | --- | --- | --- |", ...rows, "<!-- end of suites -->"].join("\n");
const FIXTURE = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "fixtures", "suites.json"), "utf8"));
const IT = 'import { it } from "node:test";\n';
const EMBEDDED = "test/unit/a.test.mjs > unit > guard/T1 [guard/F1]: one";

/** A repository holding one case per realization, every suite scheduled by some lane. */
function base() {
  return {
    "packages/kaal-guard/package.json": JSON.stringify({ scripts: { test: "node test/verify.mjs" } }),
    "packages/kaal-guard/test/verify.json": JSON.stringify({ cases: [EMBEDDED] }),
    "packages/kaal-guard/test/unit/a.test.mjs": 'import { describe, it } from "node:test";\ndescribe("unit", () => {\n  it("guard/T1 [guard/F1]: one", () => {});\n});\n',
    "engineering/guard/testing.md": ["| guard/T2: two | guard/F1 |", suites("| Engineering acceptance | Engineering | `engineering/guard/acceptance/*.test.mjs` | none |")].join("\n"),
    "engineering/guard/acceptance/b.test.mjs": `${IT}it("guard/T2 [guard/F1]: two", () => {});\n`,
    "engineering/guard/external/testing.md": ["| guard/T3: three | guard/I6 |", suites("| External tooling | External | `engineering/guard/external/c.test.mjs` | none |")].join("\n"),
    "engineering/guard/external/c.test.mjs": `${IT}it("guard/T3 [guard/I6]: three", () => {});\n`,
    "package.json": JSON.stringify({ scripts: { "test:engineering": "node --test engineering/guard/external/c.test.mjs" } }),
    ".kaal/config/guard/Engineering.md": "---\ncommand: npm run test:engineering\nruns: [ci]\n---\n",
    ".github/workflows/ci.yml": FIXTURE.ci,
  };
}

/** A scratch repository holding `files`. */
function repo(files) {
  const root = mkdtempSync(join(tmpdir(), "kaal-t134-"));
  scratch.push(root);
  for (const [path, text] of Object.entries(files)) {
    if (text === undefined) continue;
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

/** A run record for the base fixture, every case passed, on `host` for `candidate`. */
function record(host, candidate = "c0ffee") {
  return {
    candidate,
    host,
    suites: [
      { owner: "Embedded", name: "Embedded", status: "passed" },
      { owner: "Engineering", name: "Engineering acceptance", status: "passed" },
      { owner: "External", name: "External tooling", status: "passed" },
    ],
    cases: [
      { case: EMBEDDED, owner: "Embedded", suite: "Embedded", outcome: "passed" },
      { case: "guard/T2", owner: "Engineering", suite: "Engineering acceptance", outcome: "passed" },
      { case: "guard/T3", owner: "External", suite: "External tooling", outcome: "passed" },
    ],
  };
}

const RULE = "not applicable: the host fact kaal-hosting/special-entries does not hold here";
const T2 = (r, change) => ({ ...r, cases: r.cases.map((c) => (c.case === "guard/T2" ? { ...c, ...change } : c)) });

describe("guard/I8 [guard/N14] Guard's tests placed by the realization they verify", () => {
  it("guard/T134 [guard/N14, guard/A20]: every Guard test file is in exactly one suite its owner's Test Plan declares; every case is defined in that owner's Test Plan; every declared suite is scheduled by some lane; and the package's npm test runs only the package", (t) => {
    // The audit discriminates: the base fixture is clean, and each fault is named.
    assert.deepEqual(audit(repo(base())), [], "the base fixture has a finding");
    const noRunner = FIXTURE.ci.replace("node engineering/guard/suites.mjs", "node --test packages/kaal-guard/test/unit/a.test.mjs");
    const omits = noRunner.replace("engineering/guard/acceptance/*.test.mjs", "engineering/guard/acceptance/a.test.mjs");
    const faults = {
      "a test file no suite holds": [{ "engineering/guard/external/orphan.test.mjs": 'it("guard/T3 x", () => {});\n' }, /orphan\.test\.mjs: no declared suite holds/],
      "a package test file its manifest does not ship": [{ "packages/kaal-guard/test/unit/extra.test.mjs": "\n" }, /extra\.test\.mjs: no declared suite holds/],
      "a lane glob that misses a subdirectory": [
        { ".github/workflows/ci.yml": noRunner, "engineering/guard/testing.md": base()["engineering/guard/testing.md"].replace("`engineering/guard/acceptance/*.test.mjs`", "`engineering/guard/acceptance/*.test.mjs`, `engineering/guard/acceptance/consumer/*.test.mjs`"), "engineering/guard/acceptance/consumer/d.test.mjs": 'it("guard/T2 [guard/F1]: two", () => {});\n' },
        /consumer\/d\.test\.mjs: suite Engineering acceptance is scheduled by no lane/,
      ],
      "a lane that only gates the records": [{ ".github/workflows/ci.yml": omits.replace("jobs:\n", "jobs:\n  gate:\n    runs-on: ubuntu-latest\n    steps:\n      - run: node engineering/guard/suites.mjs --gate abc --hosts linux records/*.json\n") }, /b\.test\.mjs: suite Engineering acceptance is scheduled by no lane/],
      "a lane that names files and omits one": [{ ".github/workflows/ci.yml": omits }, /b\.test\.mjs: suite Engineering acceptance is scheduled by no lane/],
      "a case in another owner's suite": [{ "engineering/guard/acceptance/b.test.mjs": 'it("guard/T3 [guard/I6]: three", () => {});\n' }, /guard\/T3 is in Engineering's suite Engineering acceptance, but External defines it/],
      "a case two Test Plans define": [{ "engineering/guard/testing.md": `| guard/T3: three |\n${base()["engineering/guard/testing.md"]}` }, /guard\/T3 is defined in more than one Test Plan/],
      "a case no Test Plan defines": [{ "engineering/guard/acceptance/b.test.mjs": 'it("guard/T9 [guard/F1]: nine", () => {});\n' }, /guard\/T9 is in Engineering's suite Engineering acceptance, but no Test Plan defines it/],
      "an unknown prerequisite": [{ "engineering/guard/external/testing.md": base()["engineering/guard/external/testing.md"].replace("| none |", "| magic |") }, /names an unknown prerequisite: magic/],
      "a suite declared in another owner's plan": [{ "engineering/guard/external/testing.md": base()["engineering/guard/external/testing.md"].replace("| External tooling | External |", "| External tooling | Engineering |") }, /is owned by Engineering, not by this plan's owner, External/],
      "a suite that names no test file": [{ "engineering/guard/external/c.test.mjs": undefined }, /names engineering\/guard\/external\/c\.test\.mjs, which holds no test file/],
      "a package npm test that runs npm test": [{ "packages/kaal-guard/package.json": JSON.stringify({ scripts: { test: "npm test --prefix ../.." } }) }, /invokes npm test recursively/],
      "a package npm test that names an Engineering path": [{ "packages/kaal-guard/package.json": JSON.stringify({ scripts: { test: "node --test ../../engineering/guard/acceptance/b.test.mjs" } }) }, /names a path outside the package/],
    };
    for (const [what, [change, expected]] of Object.entries(faults)) {
      const found = audit(repo({ ...base(), ...change }));
      assert.ok(found.some((f) => expected.test(f)), `${what}: not found; the audit gave ${JSON.stringify(found)}`);
    }

    const found = audit();
    t.diagnostic(`observed on ${process.platform}: ${found.length} findings in this repository`);
    assert.deepEqual(found, [], "Guard's tests are misplaced, or a declared suite is scheduled by no lane");
  });

  it("guard/T137 [guard/N14, guard/A20]: a run record gives every declared case exactly one outcome from the runner's own report, never counts a suite passed over a case that did not pass or apply, cites a Hosting rule for not applicable and a reason for not run, and names no undeclared case; the release gate rejects stale or mismatched candidate and host evidence and any case not passed or not applicable", (t) => {
    // The producer: a real run of the base fixture, read from the runner's report.
    const root = repo(base());
    const ran = execute(root, { candidate: "c0ffee", host: "host-a" });
    assert.deepEqual(validate(ran, root), [], "the record of a clean run has a finding");
    assert.deepEqual(ran.cases.map((c) => [c.case, c.outcome]), [[EMBEDDED, "passed"], ["guard/T2", "passed"], ["guard/T3", "passed"]], `the cases ran otherwise: ${JSON.stringify(ran.cases)}`);
    const outcomes = (files) => {
      const r = repo({ ...base(), ...files });
      return Object.fromEntries(execute(r, { candidate: "c0ffee", host: "host-a" }).cases.map((c) => [c.case, c]));
    };
    const skipped = outcomes({ "engineering/guard/acceptance/b.test.mjs": `${IT}it("guard/T2 [guard/F1]: two", { skip: "this host has no FIFO" }, () => {});\n` });
    assert.equal(skipped["guard/T2"].outcome, "not run", "a skip with no Hosting rule is not 'not run'");
    const ruled = outcomes({ "engineering/guard/acceptance/b.test.mjs": `${IT}it("guard/T2 [guard/F1]: two", { skip: ${JSON.stringify(RULE)} }, () => {});\n` });
    assert.equal(ruled["guard/T2"].outcome, "not applicable", "a skip citing a Hosting rule is not 'not applicable'");
    const failing = outcomes({ "engineering/guard/acceptance/b.test.mjs": `${IT}it("guard/T2 [guard/F1]: two", () => { throw new Error("no"); });\n` });
    assert.equal(failing["guard/T2"].outcome, "failed", "a failing case is not 'failed'");
    const absent = outcomes({ "engineering/guard/acceptance/b.test.mjs": `${IT}function never() {\n  it("guard/T2 [guard/F1]: two", () => {});\n}\n` });
    assert.equal(absent["guard/T2"].outcome, "not run", "a declared case the runner never reported is not 'not run'");
    const unprovided = outcomes({ "engineering/guard/testing.md": base()["engineering/guard/testing.md"].replace("| none |", "| workspace |") });
    assert.equal(unprovided["guard/T2"].outcome, "not run", "a suite whose prerequisite is missing is not 'not run'");
    assert.match(unprovided["guard/T2"].reason, /did not provide KAAL's workspace/, "the missing prerequisite is not named");

    // The record's own checks.
    assert.deepEqual(validate(record("host-a"), root), [], "the clean record has a finding");
    const faults = {
      "a declared case with no outcome": [{ ...record("host-a"), cases: record("host-a").cases.filter((c) => c.case !== "guard/T2") }, /guard\/T2: declared in suite Engineering acceptance, and the record gives it no outcome/],
      "a case with two outcomes": [{ ...record("host-a"), cases: [...record("host-a").cases, record("host-a").cases[1]] }, /guard\/T2: the record gives it 2 outcomes/],
      "a suite counted passed over a case not run": [T2(record("host-a"), { outcome: "not run", reason: "skipped" }), /suite Engineering acceptance: counted passed while guard\/T2 is not run/],
      "not applicable without a Hosting rule": [T2(record("host-a"), { outcome: "not applicable", reason: "this host has no FIFO" }), /guard\/T2: not applicable without a Hosting rule/],
      "not run without a reason": [T2(record("host-a"), { outcome: "not run" }), /guard\/T2: not run without a reason/],
      "an undeclared case": [{ ...record("host-a"), cases: [...record("host-a").cases, { case: "guard/T9", suite: "Engineering acceptance", outcome: "passed" }] }, /guard\/T9: in the record under suite Engineering acceptance, which declares no such case/],
    };
    for (const [what, [r, expected]] of Object.entries(faults)) {
      const found = validate(r, root);
      assert.ok(found.some((f) => expected.test(f)), `${what}: not found; validate gave ${JSON.stringify(found)}`);
    }

    // The release gate, over one record per supported host, all for the candidate.
    const hosts = ["host-a", "host-b"];
    assert.deepEqual(gate([record("host-a"), record("host-b")], { candidate: "c0ffee", hosts }, root), [], "the clean records do not pass the gate");
    assert.deepEqual(gate([record("host-a"), T2(record("host-b"), { outcome: "not applicable", reason: RULE })], { candidate: "c0ffee", hosts }, root), [], "a case not applicable by a Hosting rule on one host does not pass the gate");
    const refused = {
      "a stale record": [[record("host-a"), record("host-b", "0ld")], hosts, /the host-b record is for 0ld, not the candidate c0ffee: stale or mismatched/],
      "a supported host with no record": [[record("host-a")], hosts, /no run record for host-b/],
      "a host given twice": [[record("host-a"), record("host-a"), record("host-b")], hosts, /2 run records for host-a/],
      "a record for an unsupported host": [[record("host-a"), record("host-b"), record("host-c")], hosts, /a record for host-c, which is not a supported host/],
      "a case declared on some hosts only": [[record("host-a"), { ...record("host-b"), cases: record("host-b").cases.filter((c) => c.case !== "guard/T2") }], hosts, /guard\/T2: declared on some hosts but not on host-b/],
      "a failed case": [[record("host-a"), T2(record("host-b"), { outcome: "failed", reason: "no" })], hosts, /guard\/T2: failed on host-b/],
      "a case not run": [[record("host-a"), T2(record("host-b"), { outcome: "not run", reason: "the lane did not provide it" })], hosts, /guard\/T2: not run on host-b/],
      "a case not applicable everywhere": [[T2(record("host-a"), { outcome: "not applicable", reason: RULE }), T2(record("host-b"), { outcome: "not applicable", reason: RULE })], hosts, /guard\/T2: not applicable on every host, so exercised nowhere/],
    };
    for (const [what, [records, supported, expected]] of Object.entries(refused)) {
      const found = gate(records, { candidate: "c0ffee", hosts: supported }, root);
      assert.ok(found.some((f) => expected.test(f)), `${what}: not refused; the gate gave ${JSON.stringify(found)}`);
    }
    t.diagnostic(`observed on ${process.platform}: the clean run's record gave ${ran.cases.length} cases, each passed`);
  });
});
