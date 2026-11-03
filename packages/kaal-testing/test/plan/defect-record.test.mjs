// testing/C54 planned outer tests: the kaal-defect record definition.
// Immutable to DO and CHECK; the DO turns them GREEN. Each title names the contracts it checks
// (plan/defect-record/*.md). They use kaal-testing's public interface only; records and Runs are plain data.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

async function defect() {
  let m;
  try {
    m = await import("kaal-testing/defect");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./defect (${e.code ?? e.message})`);
  }
  for (const f of ["check", "state"]) if (typeof m[f] !== "function") assert.fail(`blocked before behavioural assertion: kaal-testing/defect exports no ${f}`);
  return m;
}

const record = (over = {}) => ({ id: "ctx/D1", context: "ctx", expected: "x holds", observed: "x did not hold", where: "ctx/lib", status: "reported", ...over });
/** Testing's own model (testing/F24, F25) and Runs of it (testing/F30, F31); a Run's place in the list is its time, oldest first. */
const model = { plans: [{ id: "P", suites: ["S"] }], suites: [{ id: "S", cases: ["ctx/T1", "ctx/T2"] }], cases: [{ id: "ctx/T1", version: "1", tests: ["ctx/D1"] }, { id: "ctx/T2", version: "1", tests: ["ctx/D1"] }] };
const PROV = { P: null, S: null, "ctx/T1": "1", "ctx/T2": "1" };
let n = 0;
/** A Run of the model; `prov` overrides what its provenance identifies. */
const run = (outcomes, prov = {}) => ({ id: `r${++n}`, of: "P", provenance: { ...PROV, ...prov }, outcomes });
const evidence = (...runs) => ({ model, runs });
const FAIL = { "ctx/T1": "failed", "ctx/T2": "failed" };
const PASS = { "ctx/T1": "passed", "ctx/T2": "passed" };
const text = (f) => JSON.stringify(f);

describe("kaal-defect record", () => {
  it("testing/T116 [testing/F98, testing/F99]: a well-formed record has no findings; each missing or empty required member, duplicate id, unknown key and unknown status word is a finding", async () => {
    const { check } = await defect();
    assert.deepEqual(check(record()), []);
    for (const key of ["id", "context", "expected", "observed", "where", "status"]) assert.ok(check(record({ [key]: "" })).length > 0, `empty ${key}`);
    for (const key of ["id", "context", "expected", "observed", "where", "status"]) { const r = record(); delete r[key]; assert.ok(check(r).length > 0, `missing ${key}`); }
    assert.ok(check(record({ extra: 1 })).length > 0);
    assert.ok(check(record({ status: "fixed" })).length > 0);
    assert.ok(check([record(), record()]).length > 0, "duplicate id");
  });

  it("testing/T117 [testing/F99]: reported carries no tests; confirmed and answered each name at least one Case", async () => {
    const { check } = await defect();
    assert.ok(check(record({ tests: ["ctx/T1"] })).length > 0);
    assert.ok(check(record({ status: "confirmed" })).length > 0);
    assert.ok(check(record({ status: "answered", tests: [] })).length > 0);
    assert.deepEqual(check(record({ status: "confirmed", tests: ["ctx/T1"] })), []);
  });

  it("testing/T118 [testing/F99, testing/F100]: confirmed stands only with one common Run where every named Case failed; a passing, unknown or absent Case, Cases failing only in separate Runs, or a Run with model findings is a finding", async () => {
    const { state } = await defect();
    const r = record({ status: "confirmed", tests: ["ctx/T1", "ctx/T2"] });
    assert.deepEqual(state(r, evidence(run(FAIL))).findings, []);
    for (const bad of ["passed", "unknown"]) assert.ok(state(r, evidence(run({ "ctx/T1": "failed", "ctx/T2": bad }))).findings.length > 0, bad);
    assert.ok(state(r, evidence(run({ "ctx/T1": "failed" }))).findings.length > 0, "absent");
    assert.ok(state(r, evidence()).findings.length > 0, "no Run");
    assert.ok(state(r, evidence(run({ "ctx/T1": "failed", "ctx/T2": "passed" }), run({ "ctx/T1": "passed", "ctx/T2": "failed" }))).findings.length > 0, "separate Runs do not confirm");
    const bad = { ...run(FAIL), extra: 1 };
    assert.ok(state(r, evidence(bad)).findings.length > 0, "a Run with model findings shows nothing");
  });

  it("testing/T119 [testing/F99, testing/F100]: answered stands only with, for each named Case, a later Run where it passed; an earlier or missing pass, or a later failed or unknown as its latest observation, is a finding", async () => {
    const { state } = await defect();
    const r = record({ status: "answered", tests: ["ctx/T1"] });
    const red = run(FAIL);
    assert.deepEqual(state(r, evidence(red, run(PASS))).findings, []);
    assert.ok(state(r, evidence(run(PASS), red)).findings.length > 0, "passing Run before the confirming Run");
    assert.ok(state(r, evidence(red)).findings.length > 0, "no passing Run");
    assert.ok(state(r, evidence(red, run({ "ctx/T1": "unknown", "ctx/T2": "passed" }))).findings.length > 0, "unknown is not passed");
    assert.ok(state(r, evidence(red, run(PASS), run({ "ctx/T1": "failed", "ctx/T2": "passed" }))).findings.length > 0, "a later failure withdraws the answer");
  });

  it("testing/T121 [testing/F99, testing/F100]: provenance that does not identify a named Case, or identifies it at different versions in the confirming and answering Run, or a pass of a different Case version, answers or confirms nothing", async () => {
    const { state } = await defect();
    const confirmed = record({ status: "confirmed", tests: ["ctx/T1"] });
    const answered = record({ status: "answered", tests: ["ctx/T1"] });
    const noProv = run(FAIL); delete noProv.provenance["ctx/T1"];
    assert.ok(state(confirmed, evidence(noProv)).findings.length > 0, "missing provenance for the Case");
    assert.ok(state(confirmed, evidence(run(FAIL, { "ctx/T1": "2" }))).findings.length > 0, "provenance contradicts the model's Case version");
    assert.ok(state(answered, evidence(run(FAIL), run(PASS, { "ctx/T1": "2" }))).findings.length > 0, "a pass of another Case version answers nothing");
    assert.ok(state(answered, evidence(run(FAIL, { "ctx/T1": "2" }), run(PASS))).findings.length > 0, "confirming and answering Runs identify different versions");
    const noPass = run(PASS); delete noPass.provenance["ctx/T1"];
    assert.ok(state(answered, evidence(run(FAIL), noPass)).findings.length > 0, "a pass without provenance answers nothing");
  });

  it("testing/T122 [testing/F99]: passing Runs for different Cases may differ, each tied to the confirming Run's Case version; one Case's pass does not answer another's", async () => {
    const { state } = await defect();
    const r = record({ status: "answered", tests: ["ctx/T1", "ctx/T2"] });
    const red = run(FAIL);
    assert.deepEqual(state(r, evidence(red, run({ "ctx/T1": "passed" }), run({ "ctx/T2": "passed" }))).findings, []);
    assert.ok(state(r, evidence(red, run({ "ctx/T1": "passed" }))).findings.length > 0, "T2 was never observed passing");
  });

  it("testing/T120 [testing/N21, testing/A29]: the same record and Runs give the same result, and kaal-testing/defect imports no host module and no other capability", async () => {
    const { state } = await defect();
    const r = record({ status: "confirmed", tests: ["ctx/T1"] });
    const ev = evidence(run({ "ctx/T1": "failed", "ctx/T2": "failed" }));
    assert.equal(text(state(r, ev)), text(state(r, ev)));
    const here = new URL("../../lib/defect.mjs", import.meta.url);
    const src = readFileSync(here, "utf8");
    assert.deepEqual([...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]).filter((s) => !/^\.\/model\.mjs$|^kaal-testing\/model$/.test(s)), []);
  });
});
