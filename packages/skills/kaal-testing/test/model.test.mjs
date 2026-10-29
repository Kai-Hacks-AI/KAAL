// testing/C15 implementation tests for kaal-testing/model, beside the
// planned outer tests in test/plan/model.test.mjs.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { check, data, evaluate, results, tested } from "kaal-testing/model";

const SHARED = () => ({
  plans: [{ id: "P", suites: ["S1", "S2"] }],
  suites: [{ id: "S1", cases: ["c", "d"] }, { id: "S2", cases: ["c"] }],
  cases: [{ id: "c" }, { id: "d" }],
});

describe("model", () => {
  it("keeps a shared Case unknown in a Plan Run when one containing Suite did not observe it", () => {
    const run = { id: "r", of: "P", provenance: { P: null, S1: null, c: null, d: null }, outcomes: {}, runs: [{ id: "s1", of: "S1", outcomes: { c: "passed", d: "passed" } }] };
    assert.equal(results(SHARED(), run).cases.c, "unknown");
    assert.equal(results(SHARED(), run).suites.S2, "unknown");
    assert.equal(evaluate(SHARED(), run).result, "unknown");
  });

  it("gives findings, never a throw, for an outcome of a Case a Suite references but the model does not declare", () => {
    const m = { plans: [{ id: "P", suites: ["S"] }], suites: [{ id: "S", cases: ["x"] }], cases: [] };
    const e = evaluate(m, { id: "r", of: "P", provenance: { P: null, x: null }, outcomes: { x: "passed" } });
    assert.equal(e.result, "unknown");
    assert.ok(e.findings.some((f) => f.includes("x is not declared")));
  });

  it("finds an inapplicable declaration without a reason, and leaves the evaluation unknown", () => {
    const m = { plans: [{ id: "P", suites: ["S"], inapplicable: [{ case: "b" }] }], suites: [{ id: "S", cases: ["a", "b"] }], cases: [{ id: "a" }, { id: "b" }] };
    assert.deepEqual(check(m), ["P: b is declared inapplicable without a reason"]);
    assert.equal(evaluate(m, { id: "r", of: "P", provenance: { P: null, a: null }, outcomes: { a: "passed" } }).result, "unknown");
  });

  it("treats identities that name Object.prototype members as ordinary strings", () => {
    const m = { cases: [{ id: "c", tests: ["constructor", "__proto__", "toString"], uses: ["constructor"] }] };
    assert.deepEqual(Object.entries(tested(m)), [["__proto__", ["c"]], ["constructor", ["c"]], ["toString", ["c"]]]);
    assert.deepEqual(data(m), {});
    assert.ok(check({ toString: [] }).some((f) => f.includes("unknown key toString")));
    const run = { id: "r", of: "P", provenance: { P: null, S1: null, c: null, d: null }, outcomes: { c: "passed", d: "passed" }, runs: [] };
    assert.ok(evaluate(SHARED(), run, { allowances: [{ case: "toString", cite: "x" }] }).findings.includes("toString is outside P"));
    assert.ok(results(SHARED(), { id: "r", of: "P", provenance: {}, outcomes: {} }).findings.some((f) => f.includes("provenance does not identify P")));
  });

  it("keeps a Case unknown when one of two encompassed Runs of its Suite did not observe it", () => {
    const m = { plans: [{ id: "P", suites: ["S"] }], suites: [{ id: "S", cases: ["c"] }], cases: [{ id: "c" }] };
    const run = { id: "r", of: "P", provenance: { P: null, S: null, c: null }, outcomes: {}, runs: [{ id: "a", of: "S", outcomes: { c: "passed" } }, { id: "b", of: "S", outcomes: {} }] };
    assert.equal(results(m, run).cases.c, "unknown");
    assert.equal(evaluate(m, run).result, "unknown");
  });

  it("keeps Plan results as own entries whatever the Plan's identity", () => {
    const m = { plans: [{ id: "__proto__", suites: ["S"] }], suites: [{ id: "S", cases: ["c"] }], cases: [{ id: "c" }] };
    const run = { id: "r", of: "__proto__", provenance: JSON.parse('{"__proto__": null, "c": null}'), outcomes: { c: "passed" } };
    assert.deepEqual(Object.keys(results(m, run).plans), ["__proto__"]);
    assert.equal(evaluate(m, run).result, "passed");
    const suite = { suites: [{ id: "constructor", cases: ["c"] }], cases: [{ id: "c" }] };
    assert.equal(evaluate(suite, { id: "r", of: "constructor", provenance: { constructor: null, c: null }, outcomes: { c: "passed" } }).result, "unknown");
  });

  it("never throws on a malformed model, Run or options: each malformed shape is a finding and the evaluation is unknown", () => {
    const model = () => ({
      strategies: [{ id: "X", plans: ["P"] }],
      plans: [{ id: "P", suites: ["S"], inapplicable: [{ case: "d", reason: "r" }], data: [{ id: "D", content: 1 }], uses: ["D"] }],
      suites: [{ id: "S", cases: ["c", "d"] }],
      cases: [{ id: "c", tests: ["t"] }, { id: "d" }],
    });
    const run = () => ({ id: "r", of: "P", provenance: { P: null, S: null, c: null, d: null }, outcomes: {}, data: { D: null }, runs: [{ id: "s", of: "S", outcomes: { c: "passed", d: "passed" } }] });
    assert.equal(evaluate(model(), run()).result, "passed");
    const at = (o, path, v) => { let x = o; for (const k of path.slice(0, -1)) x = x[k]; x[path.at(-1)] = v; return o; };
    const BAD = [null, 7, "s", {}, [null], [7]];
    const MODEL = [["strategies"], ["strategies", 0], ["strategies", 0, "plans"], ["plans", 0, "suites"], ["plans", 0, "inapplicable"], ["plans", 0, "inapplicable", 0], ["plans", 0, "data"], ["plans", 0, "data", 0], ["plans", 0, "uses"], ["suites", 0], ["suites", 0, "cases"], ["cases"], ["cases", 0, "tests"]];
    const RUN = [["outcomes"], ["provenance"], ["data"], ["runs"], ["runs", 0], ["runs", 0, "outcomes"]];
    for (const v of BAD) {
      for (const path of MODEL) {
        const m = at(model(), path, v);
        for (const f of [check, tested, data]) assert.doesNotThrow(() => f(m), `${path.join(".")} = ${JSON.stringify(v)}`);
        const e = evaluate(m, run());
        assert.ok(e.result === "unknown" && e.findings.length, `${path.join(".")} = ${JSON.stringify(v)}`);
      }
      for (const path of RUN) {
        if (JSON.stringify(v) === "{}" && ["outcomes", "data"].includes(path.at(-1))) continue;
        const e = evaluate(model(), at(run(), path, v));
        assert.ok(e.result === "unknown" && e.findings.length, `run ${path.join(".")} = ${JSON.stringify(v)}`);
      }
      for (const m of [v, undefined]) assert.equal(evaluate(m, run()).result, "unknown");
      assert.equal(evaluate(model(), v).result, "unknown");
      assert.equal(evaluate(model(), run(), v).result, v === null || typeof v !== "object" || Array.isArray(v) ? "unknown" : "passed");
    }
  });
});
