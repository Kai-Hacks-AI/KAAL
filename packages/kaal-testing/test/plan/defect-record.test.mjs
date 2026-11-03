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
/** A Run is data: which Case failed or passed. `order` is the Run's position in time. */
const run = (order, results) => ({ order, results });
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

  it("testing/T118 [testing/F100]: confirmed stands only with a Run where each named Case failed; a passing, unknown or absent Case is a finding", async () => {
    const { state } = await defect();
    const r = record({ status: "confirmed", tests: ["ctx/T1", "ctx/T2"] });
    assert.deepEqual(state(r, [run(1, { "ctx/T1": "failed", "ctx/T2": "failed" })]).findings, []);
    for (const bad of ["passed", "unknown"]) assert.ok(state(r, [run(1, { "ctx/T1": "failed", "ctx/T2": bad })]).findings.length > 0, bad);
    assert.ok(state(r, [run(1, { "ctx/T1": "failed" })]).findings.length > 0, "absent");
    assert.ok(state(r, []).findings.length > 0, "no Run");
  });

  it("testing/T119 [testing/F100]: answered stands only with a later Run where each named Case passed; an earlier or missing passing Run is a finding", async () => {
    const { state } = await defect();
    const r = record({ status: "answered", tests: ["ctx/T1"] });
    const red = run(1, { "ctx/T1": "failed" });
    assert.deepEqual(state(r, [red, run(2, { "ctx/T1": "passed" })]).findings, []);
    assert.ok(state(r, [run(0, { "ctx/T1": "passed" }), red]).findings.length > 0, "passing Run before the confirming Run");
    assert.ok(state(r, [red]).findings.length > 0, "no passing Run");
    assert.ok(state(r, [red, run(2, { "ctx/T1": "unknown" })]).findings.length > 0, "unknown is not passed");
  });

  it("testing/T120 [testing/N21, testing/A29]: the same record and Runs give the same result, and kaal-testing/defect imports no host module and no other capability", async () => {
    const { state } = await defect();
    const r = record({ status: "confirmed", tests: ["ctx/T1"] });
    const runs = [run(1, { "ctx/T1": "failed" })];
    assert.equal(text(state(r, runs)), text(state(r, runs)));
    const here = new URL("../../lib/defect.mjs", import.meta.url);
    const src = readFileSync(here, "utf8");
    assert.deepEqual([...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]).filter((s) => !/^\.\/model\.mjs$|^kaal-testing\/model$/.test(s)), []);
  });
});
