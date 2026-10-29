// testing/C14 planned outer tests: the Testing model.
// Immutable to DO and CHECK; testing/C15 turns them GREEN. Each title names the
// contracts it checks (plan/model/*.md). They use kaal-testing's public interface
// only, on models and Runs given as plain data.
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
  for (const f of ["check", "tested", "data", "results", "evaluate"]) if (typeof m[f] !== "function") assert.fail(`blocked before behavioural assertion: kaal-testing/model exports no ${f}`);
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

/** One Run of `of` holding `outcomes`, whose provenance identifies `of` and every Case it holds a result for. */
const run = (outcomes, of = "sample/P1", id = "run-1") => ({ id, of, outcomes, provenance: Object.fromEntries([of, ...Object.keys(outcomes)].map((d) => [d, null])) });

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
    const e = evaluate(theirs, run({ "login works": "passed", "TC-0042": "failed", 42: "passed" }, "Release gate"), { allowances: [{ case: "TC-0042", cite: "ticket 7" }] });
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

  it("testing/T28 [testing/N7]: a Case's tests → subjects are opaque to Testing, of any kind; incoming views are derived, never declared; no result says anything about a subject", async () => {
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
    const { results, evaluate } = await model();
    const shown = JSON.stringify([results(SAMPLE(), run({ ...GREEN, "sample/T2": "failed" })), evaluate(SAMPLE(), run(GREEN))]);
    for (const subject of ["requirements/F3", "acme/whatever-they-define", "architecture/A2"]) assert.ok(!shown.includes(subject), `a result says nothing about ${subject}: the trace does not define its subject's semantics`);
  });
});

describe("Results (testing/C14)", () => {
  it("testing/T29 [testing/F26]: a Case is passed, failed, inapplicable only as the Plan declares it and only when it did not run, and otherwise unknown", async () => {
    const { results } = await model();
    const r = results(SAMPLE(), run({ "sample/T1": "passed", "sample/T2": "failed", "sample/T3": "skipped" }));
    assert.deepEqual(r.cases, { "sample/T1": "passed", "sample/T2": "failed", "sample/T3": "unknown", "sample/T4": "unknown" });
    assert.deepEqual(r.plans["sample/P1"].cases, { "sample/T1": "passed", "sample/T2": "failed", "sample/T3": "unknown", "sample/T4": "inapplicable" });
    assert.equal(results(SAMPLE(), run({ ...GREEN, "sample/T3": "todo" })).cases["sample/T3"], "unknown", "a todo Case is unknown");
    const ran = results(SAMPLE(), run({ ...GREEN, "sample/T4": "failed" }));
    assert.equal(ran.plans["sample/P1"].cases["sample/T4"], "failed", "a declaration never hides an observed outcome");
  });

  it("testing/T30 [testing/F27]: a Suite and a Plan are failed if any Case failed, else unknown if any is unknown, else inapplicable if all are, else passed; an empty Suite is unknown", async () => {
    const { results } = await model();
    const green = results(SAMPLE(), run(GREEN));
    assert.deepEqual(green.suites, { "sample/S1": "passed", "sample/S2": "unknown" }, "outside a Plan, T4 did not run");
    assert.equal(green.plans["sample/P1"].result, "passed");
    assert.deepEqual(green.plans["sample/P1"].suites, { "sample/S1": "passed", "sample/S2": "passed" });
    assert.equal(results(SAMPLE(), run({ ...GREEN, "sample/T3": "failed", "sample/T1": "skipped" })).plans["sample/P1"].result, "failed");
    assert.equal(results(SAMPLE(), run({ "sample/T1": "passed", "sample/T3": "passed" })).plans["sample/P1"].result, "unknown");
    const only = { plans: [{ id: "o/P1", suites: ["o/S1"], inapplicable: [{ case: "o/T1", reason: "r" }] }], suites: [{ id: "o/S1", cases: ["o/T1"] }, { id: "o/S2", cases: [] }], cases: [{ id: "o/T1" }] };
    const r = results(only, run({}, "o/P1"));
    assert.equal(r.plans["o/P1"].result, "inapplicable");
    assert.equal(results(only, run({}, "o/S2")).suites["o/S2"], "unknown", "nothing ran, so nothing is verified");
  });
});

describe("Plan evaluation (testing/C14)", () => {
  const CITE = { kind: "opaque", ref: "anything the caller names" };

  it("testing/T31 [testing/F28]: an allowed Case stays failed in the results, and the Plan's evaluation passes with its allowances listed", async () => {
    const { evaluate } = await model();
    const observed = { ...GREEN, "sample/T2": "failed" };
    assert.equal(evaluate(SAMPLE(), run(observed, "sample/P1")).result, "failed", "with no allowance, a failed Case fails the Plan");
    const e = evaluate(SAMPLE(), run(observed, "sample/P1"), { allowances: [{ case: "sample/T2", cite: CITE }] });
    assert.equal(e.result, "passed");
    assert.equal(e.cases["sample/T2"], "failed");
    assert.deepEqual(e.allowed, [{ case: "sample/T2", cite: CITE }]);
    assert.deepEqual(e.findings, []);
  });

  it("testing/T32 [testing/F28]: an allowance on a Case that did not fail is stale; unknown is never allowed; an allowance outside the Plan, or malformed, is a finding and the Plan cannot be evaluated", async () => {
    const { evaluate } = await model();
    const stale = evaluate(SAMPLE(), run(GREEN, "sample/P1"), { allowances: [{ case: "sample/T1", cite: CITE }] });
    assert.equal(stale.result, "passed");
    assert.deepEqual(stale.stale, [{ case: "sample/T1", cite: CITE }]);
    assert.deepEqual(stale.allowed, []);
    const unknown = evaluate(SAMPLE(), run({ "sample/T1": "passed", "sample/T2": "passed" }, "sample/P1"), { allowances: [{ case: "sample/T3", cite: CITE }] });
    assert.equal(unknown.result, "unknown");
    assert.deepEqual(unknown.allowed, []);
    for (const allowances of [[{ case: "other/T1", cite: CITE }], [{ case: "sample/T2" }], [{ cite: CITE }], "sample/T2"]) {
      const e = evaluate(SAMPLE(), run({ ...GREEN, "sample/T2": "failed" }, "sample/P1"), { allowances });
      assert.equal(e.result, "unknown", `${JSON.stringify(allowances)} leaves the Plan unevaluable`);
      assert.ok(e.findings.length > 0);
      assert.equal(e.cases["sample/T2"], "failed");
    }
    const broken = SAMPLE();
    broken.suites[0].cases.push("sample/T9");
    assert.equal(evaluate(broken, run(GREEN, "sample/P1")).result, "unknown", "a model finding leaves the Plan unevaluable");
    assert.equal(evaluate(SAMPLE(), run(GREEN, "sample/P9")).result, "unknown", "an undeclared Plan cannot be evaluated");
  });

  it("testing/T33 [testing/F29, testing/F33]: evaluation takes no baseline and no retention: any option but allowances is a finding, and a previous run changes no result", async () => {
    const { evaluate } = await model();
    const observed = { ...GREEN, "sample/T2": "failed" };
    for (const options of [{ base: GREEN }, { previous: GREEN }, { mode: "base" }, { retain: 10 }]) {
      const e = evaluate(SAMPLE(), run(observed, "sample/P1"), options);
      assert.equal(e.result, "unknown", `${Object.keys(options)[0]} is not an evaluation input`);
      assert.ok(e.findings.some((f) => f.includes(Object.keys(options)[0])));
    }
  });
});

describe("Runs, provenance and Test Data (testing/C14)", () => {
  it("testing/T36 [testing/F30]: a Plan, a Suite or a Case runs on its own, any number of times; a Plan Run may encompass Suite Runs and a Suite Run Case Runs; each Run holds its own Case Results, apart from the definitions", async () => {
    const { check, results } = await model();
    assert.deepEqual(check(SAMPLE()), [], "a definition that never ran is complete");
    const suite = results(SAMPLE(), run({ "sample/T1": "passed", "sample/T2": "passed" }, "sample/S1"));
    assert.deepEqual(suite.suites, { "sample/S1": "passed" });
    assert.deepEqual(suite.plans, {}, "a Suite Run evaluates no Plan");
    assert.deepEqual(results(SAMPLE(), run({ "sample/T3": "failed" }, "sample/T3")).cases, { "sample/T3": "failed" }, "a Case runs directly");
    const first = results(SAMPLE(), run({ "sample/T3": "failed" }, "sample/T3", "a"));
    const second = results(SAMPLE(), run({ "sample/T3": "passed" }, "sample/T3", "b"));
    assert.deepEqual([first.cases["sample/T3"], second.cases["sample/T3"]], ["failed", "passed"], "each Run's results are its own");
    const nested = {
      id: "plan-run", of: "sample/P1", provenance: { "sample/P1": null },
      runs: [
        { id: "s1-run", of: "sample/S1", provenance: { "sample/S1": null, "sample/T1": null, "sample/T2": null }, outcomes: { "sample/T1": "passed", "sample/T2": "passed" } },
        { id: "s2-run", of: "sample/S2", provenance: { "sample/S2": null, "sample/T2": null }, outcomes: { "sample/T2": "passed" },
          runs: [{ id: "t3-run", of: "sample/T3", provenance: { "sample/T3": null }, outcomes: { "sample/T3": "passed" } }] },
      ],
    };
    const r = results(SAMPLE(), nested);
    assert.deepEqual(r.findings, []);
    assert.equal(r.plans["sample/P1"].result, "passed", "the encompassed Runs' Case Results are the Plan Run's");
    const failing = structuredClone(nested);
    failing.runs[1].outcomes["sample/T2"] = "failed";
    assert.deepEqual([results(SAMPLE(), failing).plans["sample/P1"].suites["sample/S1"], results(SAMPLE(), failing).plans["sample/P1"].suites["sample/S2"]], ["passed", "failed"], "a Case in two Suites keeps a result per Suite Run");
    assert.equal(results(SAMPLE(), failing).plans["sample/P1"].cases["sample/T2"], "failed");
    assert.deepEqual(results(SAMPLE(), failing).suites, { "sample/S1": "passed", "sample/S2": "failed" });
    for (const [bad, why] of [
      [run({ "sample/T3": "passed" }, "sample/S1"), "a Case outside the Run's element"],
      [run({ "sample/T1": "passed" }, "sample/strategy"), "a Strategy does not run"],
      [run({ "sample/T1": "maybe" }, "sample/S1"), "an outcome the runner never gives"],
      [{ ...run({}, "sample/S1"), runs: [run({}, "sample/S2", "x")] }, "a Suite Run within a Suite Run"],
      [{ ...run({}, "sample/P1"), runs: [run({}, "sample/P1")] }, "a duplicate Run identity"],
      [{ ...run({}, "sample/T1"), at: "2026-10-29" }, "a key a Run does not define"],
    ]) assert.ok(results(SAMPLE(), bad).findings.length > 0, `${why} is a finding`);
  });

  it("testing/T37 [testing/F31]: a Run's provenance identifies the definitions and versions it executed and its effective Test Data; a Case Result counts only for the definition it identifies", async () => {
    const { results } = await model();
    const m = SAMPLE();
    m.cases[0].version = "2";
    assert.equal(results(m, { ...run({ "sample/T1": "passed" }, "sample/S1"), provenance: { "sample/S1": null, "sample/T1": "2" } }).cases["sample/T1"], "passed");
    const old = results(m, { ...run({ "sample/T1": "passed" }, "sample/S1"), provenance: { "sample/S1": null, "sample/T1": "1" } });
    assert.equal(old.cases["sample/T1"], "unknown", "a Run of another version shows nothing about this definition");
    const unnamed = results(SAMPLE(), { ...run({ "sample/T1": "failed" }, "sample/S1"), provenance: { "sample/S1": null } });
    assert.equal(unnamed.cases["sample/T1"], "unknown", "an outcome whose definition the Run does not identify is unknown");
    assert.ok(unnamed.findings.some((f) => f.includes("sample/T1")));
    assert.ok(results(SAMPLE(), { ...run({}, "sample/S1"), provenance: {} }).findings.some((f) => f.includes("sample/S1")), "a Run identifies what it ran");
    const d = SAMPLE();
    d.suites[0].data = [{ id: "sample/users", version: "v3", external: "s3://anywhere/users.csv" }];
    const effective = results(d, { ...run({ "sample/T1": "passed" }, "sample/S1"), data: { "sample/users": "v4" } });
    assert.deepEqual(effective.data, { "sample/users": "v4" }, "the effective Test Data is the Run's, as recorded");
    assert.equal(effective.cases["sample/T1"], "passed");
    assert.ok(results(d, { ...run({}, "sample/S1"), data: { "sample/nowhere": null } }).findings.length > 0, "effective Test Data must be declared");
  });

  it("testing/T38 [testing/F32]: Test Data is defined at Plan, Suite or Case level and owned by its defining context; reuse leaves ownership where it is; its content is opaque and may be external", async () => {
    const { check, data } = await model();
    const m = SAMPLE();
    m.plans[0].data = [{ id: "sample/accounts", content: { any: ["shape", 1] } }];
    m.suites[1].data = [{ id: "sample/fixture", external: "https://example.invalid/fixture" }];
    m.cases[0].data = [{ id: "sample/input", content: "abc" }];
    m.cases[2].uses = ["sample/accounts", "sample/input"];
    m.suites[0].uses = ["sample/fixture"];
    assert.deepEqual(check(m), []);
    assert.deepEqual(data(m), {
      "sample/accounts": { owner: "sample/P1", usedBy: ["sample/T3"] },
      "sample/fixture": { owner: "sample/S2", usedBy: ["sample/S1"] },
      "sample/input": { owner: "sample/T1", usedBy: ["sample/T3"] },
    });
    for (const [mutate, why] of [
      [(x) => (x.cases[2].uses = ["sample/none"]), "reusing undeclared Test Data"],
      [(x) => (x.cases[1].data = [{ id: "sample/S1" }]), "a Test Data identity that is not unique"],
      [(x) => (x.cases[1].data = [{ id: "sample/both", content: 1, external: "x" }]), "content that is both given and external"],
      [(x) => (x.strategies[0].data = [{ id: "sample/strategic" }]), "Test Data on a Strategy"],
    ]) {
      const bad = SAMPLE();
      mutate(bad);
      assert.ok(check(bad).length > 0, `${why} is a finding`);
    }
  });

  it("testing/T39 [testing/F33]: a retired Case stays declared as provenance and is no longer executable; Testing keeps no Run", async () => {
    const { check, tested, results } = await model();
    const m = SAMPLE();
    m.cases.push({ id: "sample/T5", tests: ["requirements/F9"], retired: true });
    assert.deepEqual(check(m), [], "a retired Case stays declared");
    assert.ok(!("requirements/F9" in tested(m)), "a retired Case tests nothing now");
    const inSuite = structuredClone(m);
    inSuite.suites[0].cases.push("sample/T5");
    assert.ok(check(inSuite).some((f) => f.includes("sample/T5")), "a Suite cannot select a retired Case");
    assert.ok(results(m, run({ "sample/T5": "passed" }, "sample/T5")).findings.some((f) => f.includes("sample/T5")), "a retired Case cannot run");
    const once = results(m, run({ "sample/T1": "failed" }, "sample/S1", "x"));
    const again = results(m, run({ "sample/T1": "passed" }, "sample/S1", "y"));
    assert.deepEqual([once.suites["sample/S1"], again.suites["sample/S1"]], ["failed", "unknown"], "no Run is kept: one Run's results never carry into another's");
  });
});

describe("Architecture of the model (testing/C14)", () => {
  it("testing/T34 [testing/N8]: the same model and Run give the same results, and the inputs are not changed", async () => {
    const { results, evaluate, data } = await model();
    const m = SAMPLE();
    const r = run({ ...GREEN, "sample/T2": "failed" });
    const frozen = JSON.stringify([m, r]);
    const options = { allowances: [{ case: "sample/T2", cite: "c" }] };
    assert.deepEqual(results(m, r), results(SAMPLE(), run({ ...GREEN, "sample/T2": "failed" })));
    assert.deepEqual(evaluate(m, r, options), evaluate(SAMPLE(), run({ ...GREEN, "sample/T2": "failed" }), { allowances: [{ case: "sample/T2", cite: "c" }] }));
    data(m);
    assert.equal(JSON.stringify([m, r]), frozen);
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
