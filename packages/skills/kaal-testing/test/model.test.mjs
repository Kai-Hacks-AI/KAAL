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
    const BAD = [null, 7, "s", {}, [null], [7], { toString: null }, [{ toString: null }], 1n, Symbol("s")];
    const MODEL = [["cases", 0, "id"], ["plans", 0, "id"], ["plans", 0, "data", 0, "id"], ["strategies"], ["strategies", 0], ["strategies", 0, "plans"], ["plans", 0, "suites"], ["plans", 0, "inapplicable"], ["plans", 0, "inapplicable", 0], ["plans", 0, "data"], ["plans", 0, "data", 0], ["plans", 0, "uses"], ["suites", 0], ["suites", 0, "cases"], ["cases"], ["cases", 0, "tests"]];
    const RUN = [["id"], ["of"], ["runs", 0, "id"], ["outcomes"], ["provenance"], ["data"], ["runs"], ["runs", 0], ["runs", 0, "outcomes"]];
    for (const v of BAD) {
      for (const path of MODEL) {
        if (v === "s" && path.at(-1) === "id") continue;
        const m = at(model(), path, v);
        for (const f of [check, tested, data]) assert.doesNotThrow(() => f(m), `${path.join(".")} = ${String(typeof v)}`);
        const e = evaluate(m, run());
        assert.ok(e.result === "unknown" && e.findings.length, `${path.join(".")} = ${String(typeof v)}`);
      }
      for (const path of RUN) {
        if (v === "s" && path.at(-1) === "id") continue;
        if (typeof v === "object" && v !== null && !Array.isArray(v) && Object.keys(v).length === 0 && ["outcomes", "data"].includes(path.at(-1))) continue;
        const e = evaluate(model(), at(run(), path, v));
        assert.ok(e.result === "unknown" && e.findings.length, `run ${path.join(".")} = ${String(typeof v)}`);
      }
      for (const m of [v, undefined]) assert.equal(evaluate(m, run()).result, "unknown");
      assert.equal(evaluate(model(), v).result, "unknown");
      assert.equal(evaluate(model(), run(), v).result, typeof v === "object" && v !== null && !Array.isArray(v) && Object.keys(v).length === 0 ? "passed" : "unknown");
    }
  });

  it("finds a Plan or Suite Run that does not record the declared version it executed", () => {
    const m = () => ({ plans: [{ id: "P", version: "2", suites: ["S"] }], suites: [{ id: "S", version: "5", cases: ["c"] }], cases: [{ id: "c" }] });
    const run = (P, S) => ({ id: "r", of: "P", provenance: { P, c: null }, outcomes: {}, runs: [{ id: "s", of: "S", provenance: { S }, outcomes: { c: "passed" } }] });
    assert.equal(evaluate(m(), run("2", "5")).result, "passed");
    for (const [P, S] of [[null, "5"], ["1", "5"], ["2", null], ["2", "4"]]) {
      const e = evaluate(m(), run(P, S));
      assert.equal(e.result, "unknown", `${P} ${S}`);
      assert.ok(e.findings.some((f) => f.includes("not its declared version")), `${P} ${S}`);
    }
  });

  describe("results are raw observations; only evaluate gives a verdict (Owner review 5703577468)", () => {
    const m = () => ({
      plans: [{ id: "P", suites: ["S"] }],
      suites: [{ id: "S", cases: ["c", "d"] }],
      cases: [{ id: "c", version: "1" }, { id: "d" }],
    });
    const withData = () => ({ ...m(), plans: [{ id: "P", suites: ["S"], data: [{ id: "D", version: "v1" }] }] });
    const run = (over = {}) => ({ id: "r", of: "P", provenance: { P: null, S: null, c: "1", d: null }, outcomes: {}, runs: [{ id: "s", of: "S", outcomes: { c: "passed", d: "passed" } }], ...over });

    it("a clean Run passes, and is the baseline the negative cases below depart from", () => {
      assert.equal(evaluate(m(), run()).result, "passed");
      assert.equal(evaluate(withData(), run({ data: { D: "v1" } })).result, "passed");
    });

    it("results may show passed beside findings; evaluate is then unknown, never passed", () => {
      const r = results(withData(), run({ data: { D: "v1", ghost: null } }));
      assert.ok(r.findings.length > 0);
      assert.equal(r.plans.P.result, "passed", "results reports the raw observation");
      assert.equal(evaluate(withData(), run({ data: { D: "v1", ghost: null } })).result, "unknown", "the only verdict is unknown while there is a finding");
    });

    it("malformed Run provenance never yields a clean passing evaluation", () => {
      const bad = {
        "a version that is a number": { P: null, S: null, c: 1, d: null },
        "an empty version": { P: null, S: null, c: "", d: null },
        "a version that is an object": { P: null, S: null, c: { v: "1" }, d: null },
        "an element version that is a list": { P: [], S: null, c: "1", d: null },
        "another version of the Case": { P: null, S: null, c: "2", d: null },
        "no version for a versioned Case": { P: null, S: null, c: null, d: null },
        "a Case it does not identify": { P: null, S: null, c: "1" },
        "the element it does not identify": { S: null, c: "1", d: null },
      };
      for (const [why, provenance] of Object.entries(bad)) assert.notEqual(evaluate(m(), run({ provenance })).result, "passed", why);
      assert.notEqual(evaluate(m(), run({ runs: [{ id: "s", of: "S", provenance: { c: 7 }, outcomes: { c: "passed", d: "passed" } }] })).result, "passed", "an encompassed Run's malformed provenance");
    });

    it("conflicting or duplicate occurrences never yield a clean passing evaluation", () => {
      const twice = (a, b, ids = ["s", "t"]) => run({ runs: [{ id: ids[0], of: "S", outcomes: { c: a, d: "passed" } }, { id: ids[1], of: "S", outcomes: { c: b, d: "passed" } }] });
      assert.equal(evaluate(m(), twice("passed", "failed")).result, "failed", "a Case observed passing and failing in one Plan Run is failed");
      assert.equal(evaluate(m(), twice("failed", "passed")).result, "failed", "in either order");
      assert.equal(evaluate(m(), twice("passed", "skipped")).result, "unknown", "a skipped repetition leaves it unknown");
      assert.equal(evaluate(m(), twice("passed", "passed", ["s", "s"])).result, "unknown", "a duplicate Run identity is a finding");
      const both = run({ outcomes: { c: "passed", d: "passed" }, runs: [{ id: "s", of: "S", outcomes: { c: "failed", d: "passed" } }] });
      assert.equal(evaluate(m(), both).result, "failed", "a Plan-level outcome cannot outvote an encompassed Run's failure");
      const nested = run({ runs: [{ id: "s", of: "S", outcomes: { d: "passed" }, runs: [{ id: "k1", of: "c", outcomes: { c: "passed" } }, { id: "k2", of: "c", outcomes: { c: "failed" } }] }] });
      assert.equal(evaluate(m(), nested).result, "failed", "two Case Runs within one Suite Run");
    });

    it("invalid Test Data provenance never yields a clean passing evaluation", () => {
      for (const [why, data] of Object.entries({
        "undeclared Test Data": { D: "v1", ghost: "v1" },
        "a version that is a number": { D: 1 },
        "an empty version": { D: "" },
        "a version that is a list": { D: ["v1"] },
        "data that is a list": [["D", "v1"]],
      })) {
        const e = evaluate(withData(), run({ data }));
        assert.equal(e.result, "unknown", why);
        assert.ok(e.findings.length > 0, why);
      }
    });
  });
});
