// testing/C14 planned outer tests: the Testing model.
// Immutable to DO and CHECK; testing/C15 turns them GREEN. Each title names the
// contracts it checks (plan/model/*.md). They use kaal-testing's public interface
// only, on models and observed outcomes given as plain data.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

/** kaal-testing/model with its functions, or the reason the tests are blocked before any behavioural assertion. */
async function model() {
  let m;
  try {
    m = await import("kaal-testing/model");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./model (${e.code ?? e.message})`);
  }
  for (const f of ["check", "tested", "results", "evaluate"]) if (typeof m[f] !== "function") assert.fail(`blocked before behavioural assertion: kaal-testing/model exports no ${f}`);
  return m;
}

/** A small product model: one Strategy, one Plan over two Suites that share sample/T2. */
const SAMPLE = () => ({
  strategies: [{ id: "sample/strategy", plans: ["sample/P1"] }],
  plans: [{ id: "sample/P1", suites: ["sample/S1", "sample/S2"], inapplicable: [{ case: "sample/T4", reason: "needs a second host" }] }],
  suites: [
    { id: "sample/S1", cases: ["sample/T1", "sample/T2"] },
    { id: "sample/S2", cases: ["sample/T2", "sample/T3", "sample/T4"] },
  ],
  cases: [
    { id: "sample/T1", tests: ["requirements/F3"] },
    { id: "sample/T2", tests: ["requirements/F3", "acme/whatever-they-define"] },
    { id: "sample/T3" },
    { id: "sample/T4", tests: ["architecture/A2"] },
  ],
});
const GREEN = { "sample/T1": "passed", "sample/T2": "passed", "sample/T3": "passed" };

describe("Kinds, identities and relationships (testing/C14)", () => {
  it("testing/T26 [testing/F24]: identities are the holder's: any nonempty string, unique across the model; Testing imposes no format, and a model whose Cases use another holder's identities is checked and evaluated like any other", async () => {
    const { check, evaluate } = await model();
    assert.deepEqual(check(SAMPLE()), []);
    const theirs = {
      plans: [{ id: "Release gate", suites: ["smoke"] }],
      suites: [{ id: "smoke", cases: ["login works", "TC-0042", "42"] }],
      cases: [{ id: "login works" }, { id: "TC-0042" }, { id: "42" }],
    };
    assert.deepEqual(check(theirs), [], "an external holder's identities are its own");
    const e = evaluate(theirs, { "login works": "passed", "TC-0042": "failed", 42: "passed" }, "Release gate", { allowances: [{ case: "TC-0042", cite: "ticket 7" }] });
    assert.equal(e.result, "passed");
    assert.equal(e.cases["TC-0042"], "failed");
    const m = SAMPLE();
    m.suites[1].id = "sample/S1";
    assert.ok(check(m).some((f) => f.includes("sample/S1")), "a duplicate identity is a finding");
    for (const id of ["", 7, undefined]) {
      const bad = SAMPLE();
      bad.cases[2].id = id;
      bad.suites[1].cases[1] = id;
      assert.ok(check(bad).length > 0, `${JSON.stringify(id)} is not an identity`);
    }
  });

  it("testing/T27 [testing/F25]: only the levels a product uses are declared; a Strategy names at least one Plan and a Plan at least one Suite; a Case is defined once and may be in several Suites; a reference to an undeclared element is a finding", async () => {
    const { check } = await model();
    assert.deepEqual(check({ suites: [{ id: "lean/S1", cases: ["lean/T1"] }], cases: [{ id: "lean/T1" }] }), [], "a Suite of Cases alone is a model");
    assert.deepEqual(check({ cases: [{ id: "lean/T1" }] }), [], "Cases alone are a model");
    const m = SAMPLE();
    m.suites[0].cases.push("sample/T9");
    m.plans[0].suites.push("sample/S9");
    m.strategies[0].plans.push("sample/P9");
    const found = check(m);
    for (const id of ["sample/T9", "sample/S9", "sample/P9"]) assert.ok(found.some((f) => f.includes(id)), `${id} is undeclared`);
    const twice = SAMPLE();
    twice.cases.push({ id: "sample/T2" });
    assert.ok(check(twice).some((f) => f.includes("sample/T2")), "a Case is defined once");
    const strategy = SAMPLE();
    strategy.strategies[0].plans = [];
    assert.ok(check(strategy).some((f) => f.includes("sample/strategy")), "a Strategy names at least one Plan");
    const plan = SAMPLE();
    plan.plans[0].suites = [];
    assert.ok(check(plan).some((f) => f.includes("sample/P1")), "a Plan names at least one Suite");
    const shared = SAMPLE();
    shared.plans.push({ id: "sample/P2", suites: ["sample/S1"] });
    shared.strategies.push({ id: "sample/other", plans: ["sample/P1", "sample/P2"] });
    assert.deepEqual(check(shared), [], "a Suite may serve several Plans, and a Plan several Strategies");
  });

  it("testing/T28 [testing/N7]: a Case's tests → subjects are opaque to Testing, of any kind; incoming views are derived, never declared", async () => {
    const { check, tested } = await model();
    assert.deepEqual(tested(SAMPLE()), {
      "acme/whatever-they-define": ["sample/T2"],
      "architecture/A2": ["sample/T4"],
      "requirements/F3": ["sample/T1", "sample/T2"],
    });
    const any = SAMPLE();
    any.cases[2].tests = ["x", "zz/unheard-of kind 7"];
    assert.deepEqual(check(any), [], "Testing restricts no subject's kind");
    for (const bad of [[""], [7], "requirements/F3"]) {
      const m = SAMPLE();
      m.cases[2].tests = bad;
      assert.ok(check(m).length > 0, `tests ${JSON.stringify(bad)} is a finding`);
    }
    const incoming = SAMPLE();
    incoming.cases[0].testedBy = ["sample/T2"];
    assert.ok(check(incoming).some((f) => f.includes("testedBy")), "a declared incoming trace is a finding, like any unknown key");
  });
});

describe("Results (testing/C14)", () => {
  it("testing/T29 [testing/F26]: a Case is passed, failed, inapplicable only as the Plan declares it and only when it did not run, and otherwise unknown", async () => {
    const { results } = await model();
    const r = results(SAMPLE(), { "sample/T1": "passed", "sample/T2": "failed", "sample/T3": "skipped" });
    assert.deepEqual(r.cases, { "sample/T1": "passed", "sample/T2": "failed", "sample/T3": "unknown", "sample/T4": "unknown" });
    assert.deepEqual(r.plans["sample/P1"].cases, { "sample/T1": "passed", "sample/T2": "failed", "sample/T3": "unknown", "sample/T4": "inapplicable" });
    assert.equal(results(SAMPLE(), { ...GREEN, "sample/T3": "todo" }).cases["sample/T3"], "unknown", "a todo Case is unknown");
    const ran = results(SAMPLE(), { ...GREEN, "sample/T4": "failed" });
    assert.equal(ran.plans["sample/P1"].cases["sample/T4"], "failed", "a declaration never hides an observed outcome");
  });

  it("testing/T30 [testing/F27]: a Suite and a Plan are failed if any Case failed, else unknown if any is unknown, else inapplicable if all are, else passed; an empty Suite is unknown", async () => {
    const { results } = await model();
    const green = results(SAMPLE(), GREEN);
    assert.deepEqual(green.suites, { "sample/S1": "passed", "sample/S2": "unknown" }, "outside a Plan, T4 did not run");
    assert.equal(green.plans["sample/P1"].result, "passed");
    assert.deepEqual(green.plans["sample/P1"].suites, { "sample/S1": "passed", "sample/S2": "passed" });
    assert.equal(results(SAMPLE(), { ...GREEN, "sample/T3": "failed", "sample/T1": "skipped" }).plans["sample/P1"].result, "failed");
    assert.equal(results(SAMPLE(), { "sample/T1": "passed", "sample/T3": "passed" }).plans["sample/P1"].result, "unknown");
    const only = { plans: [{ id: "o/P1", suites: ["o/S1"], inapplicable: [{ case: "o/T1", reason: "r" }] }], suites: [{ id: "o/S1", cases: ["o/T1"] }, { id: "o/S2", cases: [] }], cases: [{ id: "o/T1" }] };
    const r = results(only, {});
    assert.equal(r.plans["o/P1"].result, "inapplicable");
    assert.equal(r.suites["o/S2"], "unknown", "nothing ran, so nothing is verified");
  });
});

describe("Plan evaluation (testing/C14)", () => {
  const CITE = { kind: "opaque", ref: "anything the caller names" };

  it("testing/T31 [testing/F28]: an allowed Case stays failed in the results, and the Plan's evaluation passes with its allowances listed", async () => {
    const { evaluate } = await model();
    const observed = { ...GREEN, "sample/T2": "failed" };
    assert.equal(evaluate(SAMPLE(), observed, "sample/P1").result, "failed", "with no allowance, a failed Case fails the Plan");
    const e = evaluate(SAMPLE(), observed, "sample/P1", { allowances: [{ case: "sample/T2", cite: CITE }] });
    assert.equal(e.result, "passed");
    assert.equal(e.cases["sample/T2"], "failed");
    assert.deepEqual(e.allowed, [{ case: "sample/T2", cite: CITE }]);
    assert.deepEqual(e.findings, []);
  });

  it("testing/T32 [testing/F28]: an allowance on a Case that did not fail is stale; unknown is never allowed; an allowance outside the Plan, or malformed, is a finding and the Plan cannot be evaluated", async () => {
    const { evaluate } = await model();
    const stale = evaluate(SAMPLE(), GREEN, "sample/P1", { allowances: [{ case: "sample/T1", cite: CITE }] });
    assert.equal(stale.result, "passed");
    assert.deepEqual(stale.stale, [{ case: "sample/T1", cite: CITE }]);
    assert.deepEqual(stale.allowed, []);
    const unknown = evaluate(SAMPLE(), { "sample/T1": "passed", "sample/T2": "passed" }, "sample/P1", { allowances: [{ case: "sample/T3", cite: CITE }] });
    assert.equal(unknown.result, "unknown");
    assert.deepEqual(unknown.allowed, []);
    for (const allowances of [[{ case: "other/T1", cite: CITE }], [{ case: "sample/T2" }], [{ cite: CITE }], "sample/T2"]) {
      const e = evaluate(SAMPLE(), { ...GREEN, "sample/T2": "failed" }, "sample/P1", { allowances });
      assert.equal(e.result, "unknown", `${JSON.stringify(allowances)} leaves the Plan unevaluable`);
      assert.ok(e.findings.length > 0);
      assert.equal(e.cases["sample/T2"], "failed");
    }
    const broken = SAMPLE();
    broken.suites[0].cases.push("sample/T9");
    assert.equal(evaluate(broken, GREEN, "sample/P1").result, "unknown", "a model finding leaves the Plan unevaluable");
    assert.equal(evaluate(SAMPLE(), GREEN, "sample/P9").result, "unknown", "an undeclared Plan cannot be evaluated");
  });

  it("testing/T33 [testing/F29]: evaluation takes no baseline: any option but allowances is a finding, and a previous run changes no result", async () => {
    const { evaluate } = await model();
    const observed = { ...GREEN, "sample/T2": "failed" };
    for (const options of [{ base: GREEN }, { previous: GREEN }, { mode: "base" }]) {
      const e = evaluate(SAMPLE(), observed, "sample/P1", options);
      assert.equal(e.result, "unknown", `${Object.keys(options)[0]} is not an evaluation input`);
      assert.ok(e.findings.some((f) => f.includes(Object.keys(options)[0])));
    }
  });
});

describe("Architecture of the model (testing/C14)", () => {
  it("testing/T34 [testing/N8]: the same model and observed outcomes give the same results, and the inputs are not changed", async () => {
    const { results, evaluate } = await model();
    const m = SAMPLE();
    const observed = { ...GREEN, "sample/T2": "failed" };
    const frozen = JSON.stringify([m, observed]);
    const options = { allowances: [{ case: "sample/T2", cite: "c" }] };
    assert.deepEqual(results(m, observed), results(SAMPLE(), { ...observed }));
    assert.deepEqual(evaluate(m, observed, "sample/P1", options), evaluate(SAMPLE(), { ...observed }, "sample/P1", { allowances: [{ case: "sample/T2", cite: "c" }] }));
    assert.equal(JSON.stringify([m, observed]), frozen);
  });

  it("testing/T35 [testing/A12]: `kaal-testing/model` is one module that imports nothing and names no other capability's kind", async () => {
    await model();
    const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
    assert.equal(pkg.exports["./model"], "./lib/model.mjs");
    const source = readFileSync(new URL("../../lib/model.mjs", import.meta.url), "utf8");
    assert.deepEqual(source.match(/^\s*import\b.*$|\bimport\s*\(|\brequire\s*\(/gm) ?? [], [], "the model imports nothing");
    assert.deepEqual(source.match(/\b(intent|requirements?|architecture|defects?|functional|nonfunctional|feature|regression|far)\b/gi) ?? [], [], "the model names no other capability's kind and no FAR role");
  });
});
