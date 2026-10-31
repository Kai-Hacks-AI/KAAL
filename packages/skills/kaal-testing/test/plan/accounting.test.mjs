// testing/C33 planned outer tests: what covered, allocated and unverified mean for a shipped package's
// identifiers, derived from Testing's model (Case —tests→ Target) and one run's outcomes, and how every consumer
// verifier reports them. Immutable to DO and CHECK; testing/C34 turns them GREEN. Each title names the contracts
// it checks (plan/accounting/*.md). They use kaal-testing's public interface only, on runs given as their exit
// status and output, and on facts a publisher's harness established.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** kaal-testing's coverage accounting, or the reason the tests are blocked before any behavioural assertion. */
async function contract() {
  let m, model;
  try {
    m = await import("kaal-testing/verifiers");
    model = await import("kaal-testing/model");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./verifiers or ./model (${e.code ?? e.message})`);
  }
  for (const f of ["observe", "account", "judgeCoverage"]) if (typeof m[f] !== "function") assert.fail(`blocked before behavioural assertion: kaal-testing/verifiers exports no ${f}`);
  if (!Array.isArray(m.COVERAGE_SCENARIOS)) assert.fail("blocked before behavioural assertion: kaal-testing/verifiers exports no COVERAGE_SCENARIOS");
  return { ...m, check: model.check, tested: model.tested };
}

/** A verifier of its own: Guard's words, under another prefix. */
const VERIFIER = { prefix: "acme-verification ", words: { verified: "verified", failed: "failed", unknown: "cannot verify" } };
const EXIT = { verified: 0, failed: 1, unknown: 2 };
const [F1, F2, F3, T1, T2] = ["acme/F1", "acme/F2", "acme/F3", "acme/T1", "acme/T2"];
/** The applicability the harness established for the targeted case: a platform scope that excludes this platform, and a reason. */
const SCOPE = { platforms: ["win32"], reason: "acme/T2 checks Windows ACLs" };
const ALLOCATION = "the publisher's Engineering Test Plan: its release lane runs engineering/T7";
const REASON = "no Test Case can observe a maintainer's intent";
/** Testing's model as the manifest delivers it: each Case states once what it tests, and nothing else restates it. */
const MODEL = { cases: [{ id: T1, tests: [F1, F3] }, { id: T2, tests: [F2, F3] }] };
/** What the harness itself established: the shipped identifiers, the delivered model and the declared cases. */
const FACTS = {
  package: { name: "@acme/thing", version: "1.2.3", location: "/consumer/node_modules/@acme/thing" },
  platform: "linux",
  node: "v24.1.0",
  digest: "d".repeat(64),
  cases: [T1, T2],
  target: T2,
  applicability: {},
  dependencies: [],
  complements: {},
  identifiers: [F1, F2, F3],
  model: MODEL,
};
const with3 = (tests1, tests2, targets) => ({ ...FACTS, model: { cases: [{ id: T1, tests: tests1 }, { id: T2, tests: tests2 }], ...(targets ? { targets } : {}) } });
const FACTS_BY = {
  "coverage-allocated": with3([F1], [F2], [{ id: F3, allocated: ALLOCATION }]),
  "coverage-unverified": with3([F1], [F2], [{ id: F3, unverified: REASON }]),
  "coverage-not-applicable": { ...with3([F1, F3], [F2]), applicability: { [T2]: SCOPE } },
  "coverage-missing": with3([F1], [F2]),
  "coverage-undeclared-case": { ...FACTS, model: { cases: [{ id: T1, tests: [F1] }, { id: T2, tests: [F2] }, { id: "acme/T9", tests: [F3] }] } },
  "coverage-allocated-and-traced": { ...FACTS, model: { ...MODEL, targets: [{ id: F3, allocated: ALLOCATION }] } },
  "coverage-not-shipped": with3([F1, F3], [F2, "acme/F9"]),
};
const factsFor = (id) => FACTS_BY[id] ?? FACTS;
/** What the contract expects in each coverage scenario, owned by these tests rather than read from the implementation. */
const EXPECTED = {
  "coverage-complete": { result: "verified", coverage: { [F1]: "covered", [F2]: "covered", [F3]: "covered" } },
  "coverage-allocated": { result: "verified", coverage: { [F1]: "covered", [F2]: "covered", [F3]: "allocated" } },
  "coverage-unverified": { result: "verified", coverage: { [F1]: "covered", [F2]: "covered", [F3]: "unverified" } },
  "coverage-not-applicable": { result: "verified", target: "not applicable", coverage: { [F1]: "covered", [F2]: "not applicable", [F3]: "covered" } },
  "coverage-missing": { result: "unknown", coverage: { [F1]: "covered", [F2]: "covered", [F3]: "uncovered" } },
  "coverage-undeclared-case": { result: "unknown", coverage: { [F1]: "covered", [F2]: "covered", [F3]: "uncovered" } },
  "coverage-allocated-and-traced": { result: "unknown", coverage: { [F1]: "covered", [F2]: "covered", [F3]: "uncovered" } },
  "coverage-not-shipped": { result: "unknown", coverage: { [F1]: "covered", [F2]: "covered", [F3]: "covered", "acme/F9": "not shipped" } },
  "coverage-failing": { result: "failed", target: "fail", coverage: { [F1]: "covered", [F2]: "failed", [F3]: "failed" } },
};
/** The summary a conforming verifier prints in coverage scenario `id`: what the contract expects, in the verifier's words. */
function conforming(id) {
  const { result, target, coverage } = EXPECTED[id];
  const facts = factsFor(id);
  const outcome = (name) => (target && name === FACTS.target ? target : "pass");
  return {
    result: VERIFIER.words[result],
    ...(result === "verified" ? {} : { cause: `the ${id} scenario`, evidence: [`what the verifier observed in ${id}`], next: { kind: "diagnostic", step: "inspect the evidence" } }),
    package: { ...FACTS.package },
    platform: FACTS.platform,
    node: FACTS.node,
    digest: FACTS.digest,
    cases: FACTS.cases.map((name) => ({ name, outcome: outcome(name), ...(outcome(name) === "not applicable" ? { applicability: structuredClone(facts.applicability[name]) } : {}) })),
    coverage: Object.entries(coverage).map(([cid, state]) => ({ id: cid, state })),
  };
}
/** `summary` claiming `result`, with exactly the diagnosis testing/F49 asks of that result, so only the claim itself can disagree. */
function claiming(summary, result) {
  const { cause, evidence, uncertainty, next, ...rest } = summary;
  if (result === "verified") return { ...rest, result: VERIFIER.words.verified };
  return { ...rest, result: VERIFIER.words[result], cause: cause ?? "claimed", evidence: evidence ?? ["what the verifier claims"], next: next ?? { kind: "diagnostic", step: "inspect the evidence" } };
}
const run = (summary, exit) => ({ exit, stdout: `case acme/T1 ...\n${VERIFIER.prefix}${JSON.stringify(summary)}\nnpm notice after it\n` });
const states = (a) => Object.fromEntries(a.entries.map((e) => [e.id, e.state]));
/** The run outcomes for `facts`: every declared case passed, except `overrides`. */
const outcomes = (overrides = {}) => ({ [T1]: "pass", [T2]: "pass", ...overrides });

describe("What covered, allocated and unverified mean for a shipped package (testing/C33)", () => {
  it("testing/T63 [testing/F51, testing/F25]: the static trace derives each shipped identifier's state from the model's Case traces and target entries, and is unresolved where an identifier has none, an entry restates a trace, or a trace names one the package does not ship", async () => {
    const { account, check, tested } = await contract();
    const facts = with3([F1], [F1], [{ id: F2, allocated: ALLOCATION }, { id: F3, unverified: REASON }]);
    assert.deepEqual(check(facts.model), [], "a target entry is part of Testing's model");
    assert.deepEqual(tested(facts.model), { [F1]: [T1, T2] }, "a target entry adds no trace: only a Case's tests do");
    const traced = account(facts);
    assert.deepEqual(states(traced), { [F1]: "traced", [F2]: "allocated", [F3]: "unverified" });
    assert.equal(traced.result, "verified", "an allocated or unverified identifier leaves the trace resolved");
    assert.deepEqual(traced.findings, []);
    const malformed = {
      "no Case and no entry": undefined,
      "two forms": { id: F3, allocated: ALLOCATION, unverified: REASON },
      "no form": { id: F3 },
      "an empty allocation": { id: F3, allocated: "" },
      "an empty reason": { id: F3, unverified: "" },
      "an entry that lists cases, restating a trace": { id: F3, cases: [T1] },
      "an applicability beside an allocation": { id: F3, allocated: ALLOCATION, applicability: SCOPE },
    };
    for (const [why, entry] of Object.entries(malformed)) {
      const a = account(with3([F1], [F2], entry === undefined ? undefined : [entry]));
      assert.equal(states(a)[F3], "uncovered", why);
      assert.equal(a.result, "unknown", `${why} leaves the trace unresolved`);
      if (entry !== undefined) assert.ok(check(with3([F1], [F2], [entry]).model).length > 0, `${why} is a finding of the model`);
    }
    const both = account({ ...FACTS, model: { ...MODEL, targets: [{ id: F3, allocated: ALLOCATION }] } });
    assert.equal(states(both)[F3], "uncovered", "an allocation never stands beside a Case's trace of the same identifier");
    assert.equal(both.result, "unknown");
    const twice = account(with3([F1], [F2], [{ id: F3, allocated: ALLOCATION }, { id: F3, unverified: REASON }]));
    assert.equal(states(twice)[F3], "uncovered", "an identifier has at most one target entry");
    const undeclared = account({ ...FACTS, model: { cases: [{ id: T1, tests: [F1] }, { id: T2, tests: [F2] }, { id: "acme/T9", tests: [F3] }] } });
    assert.equal(states(undeclared)[F3], "uncovered", "a trace by a case the manifest does not declare covers nothing");
    const retired = account({ ...FACTS, model: { cases: [{ id: T1, tests: [F1] }, { id: T2, tests: [F2, F3], retired: true }] } });
    assert.equal(states(retired)[F3], "uncovered", "a retired case traces nothing");
    const named = account({ ...FACTS, identifiers: [F1, "constructor"], model: { cases: [{ id: T1, tests: [F1] }] } });
    assert.equal(states(named).constructor, "uncovered", "an identifier named like an Object.prototype member has no inherited trace");
    const extra = account(with3([F1, F3], [F2, "acme/F9"]));
    assert.equal(states(extra)["acme/F9"], "not shipped");
    assert.equal(extra.result, "unknown");
    const extraEntry = account({ ...FACTS, model: { ...MODEL, targets: [{ id: "acme/F9", unverified: REASON }] } });
    assert.equal(states(extraEntry)["acme/F9"], "not shipped", "a target entry for an identifier the package does not ship");
    for (const facts of [{ ...FACTS, identifiers: undefined }, { ...FACTS, identifiers: [], model: { cases: [] } }, { ...FACTS, identifiers: [F1, F1], model: { cases: [{ id: T1, tests: [F1] }] } }, { ...FACTS, model: undefined }, { ...FACTS, model: { cases: [{ id: T1, tests: [F1, F2, F3] }, { id: T1, tests: [F1] }] } }]) {
      const a = account(facts);
      assert.equal(a.result, "unknown", JSON.stringify(facts.identifiers ?? facts.model ?? null));
      assert.ok(a.findings.length > 0, "the harness established no identifiers or no readable model");
    }
  });

  it("testing/T64 [testing/F52]: in a run, an identifier is covered only where a declared case tracing it passed; any failing case fails it; cases that did not pass leave it uncovered", async () => {
    const { account } = await contract();
    assert.deepEqual(states(account(FACTS, outcomes())), { [F1]: "covered", [F2]: "covered", [F3]: "covered" });
    assert.deepEqual(states(account(FACTS, outcomes({ [T2]: "fail" }))), { [F1]: "covered", [F2]: "failed", [F3]: "failed" }, "a failing case fails every identifier it traces, even beside a passing one");
    for (const outcome of ["skipped", "todo", "not run"]) {
      const a = account(FACTS, outcomes({ [T2]: outcome }));
      assert.equal(states(a)[F2], "uncovered", `a case ${outcome} covers nothing`);
      assert.equal(states(a)[F3], "covered", "one passing case covers its identifier");
    }
    assert.equal(states(account(FACTS, { [T1]: "pass" }))[F2], "uncovered", "a case with no outcome in the run covers nothing");
    const na = { ...FACTS, applicability: { [T2]: SCOPE } };
    assert.equal(states(account(na, outcomes({ [T1]: "skipped", [T2]: "not applicable" })))[F3], "uncovered", "a skipped case beside a not applicable one covers nothing");
    const allocated = with3([F1], [F2], [{ id: F3, allocated: ALLOCATION }]);
    assert.equal(states(account(allocated, outcomes()))[F3], "allocated", "an allocation carries into the run, never as covered");
  });

  it("testing/T65 [testing/F52, testing/F47]: an identifier whose every tracing case is not applicable is not applicable only where the harness established each case's applicability excluding the run; otherwise it is uncovered", async () => {
    const { account } = await contract();
    const na = outcomes({ [T2]: "not applicable" });
    const only2 = (applicability, extra = {}) => account({ ...with3([F1, F3], [F2]), applicability: { [T2]: applicability }, ...extra }, na);
    assert.equal(states(only2(SCOPE))[F2], "not applicable");
    assert.equal(only2(SCOPE).result, "verified", "an identifier not applicable here leaves the run verified, and is listed");
    for (const [why, applicability] of Object.entries({
      "no reason": { platforms: ["win32"] },
      "a scope that includes this platform": { platforms: ["linux", "win32"], reason: "r" },
      "an empty scope": { platforms: [], reason: "r" },
      "a required dependency named as a complement": { requires: ["@acme/core"], reason: "r" },
    })) {
      const a = only2(applicability, { dependencies: ["@acme/core"], complements: { "@acme/core": "absent" } });
      assert.equal(states(a)[F2], "uncovered", why);
      assert.equal(a.result, "unknown", `${why}: the run is unknown`);
    }
    assert.equal(states(account(with3([F1, F3], [F2]), na))[F2], "uncovered", "a case reported not applicable without an established applicability excludes nothing");
    const complement = { requires: ["@acme/graph"], reason: "needs Graph" };
    assert.equal(states(only2(complement, { complements: { "@acme/graph": "absent" } }))[F2], "not applicable", "an optional complement established absent excludes the run (testing/F47)");
    assert.equal(states(only2(complement))[F2], "uncovered", "a complement the harness did not establish absent excludes nothing");
    assert.equal(states(account({ ...FACTS, applicability: { [T2]: SCOPE } }, na))[F3], "covered", "a passing case beside a not applicable one covers its identifier");
    assert.equal(states(account({ ...FACTS, applicability: { [T2]: SCOPE } }, outcomes()))[F2], "covered", "an applicability that would exclude never hides a case observed passing");
  });

  it("testing/T66 [testing/F53]: failed is established by a failing case; otherwise any uncovered or not shipped identifier, or a model finding, makes the run unknown; allocated, unverified and not applicable never count as covered and never change verified", async () => {
    const { account } = await contract();
    const missing = with3([F1], [F2]);
    assert.equal(account(missing, outcomes({ [T2]: "fail" })).result, "failed", "a failure is established beside an uncovered identifier");
    assert.equal(account(missing, outcomes()).result, "unknown");
    const listed = with3([F1], [F1], [{ id: F2, allocated: ALLOCATION }, { id: F3, unverified: REASON }]);
    const a = account(listed, outcomes());
    assert.equal(a.result, "verified");
    assert.deepEqual(states(a), { [F1]: "covered", [F2]: "allocated", [F3]: "unverified" }, "neither allocated nor unverified is reported as covered");
    assert.equal(account(with3([F1, F3], [F2, "acme/F9"]), outcomes()).result, "unknown");
    assert.equal(account({ ...FACTS, model: { ...MODEL, strategies: "x" } }, outcomes()).result, "unknown", "a model with a finding is not evidence of coverage");
  });

  it("testing/T67 [testing/F54]: the contract names its coverage scenarios, each with the change a harness makes to the delivered model or run, the state it realizes and the result every conforming verifier shows", async () => {
    const { COVERAGE_SCENARIOS } = await contract();
    const ids = COVERAGE_SCENARIOS.map((s) => s.id);
    for (const id of Object.keys(EXPECTED)) assert.ok(ids.includes(id), `${id} is a coverage scenario`);
    assert.equal(new Set(ids).size, ids.length, "scenario identities are unique");
    for (const s of COVERAGE_SCENARIOS) {
      assert.ok(typeof s.change === "string" && s.change.length > 0, `${s.id} says what the harness changes`);
      const want = EXPECTED[s.id] ?? { result: "unknown" };
      assert.equal(s.result, want.result, `${s.id} expects ${want.result}`);
      if (EXPECTED[s.id]) assert.equal(s.target, want.target, `${s.id} targets ${want.target}`);
    }
    assert.ok(Object.isFrozen(COVERAGE_SCENARIOS) && COVERAGE_SCENARIOS.every(Object.isFrozen), "a caller cannot change the contract");
  });

  it("testing/T68 [testing/F55]: a verifier that shows what the contract expects conforms in every coverage scenario; any other reported coverage or result never conforms", async () => {
    const { observe, judgeCoverage } = await contract();
    const judged = (id, summary, exit) => judgeCoverage(id, observe(run(summary, exit), VERIFIER), factsFor(id));
    for (const [id, { result }] of Object.entries(EXPECTED)) {
      const j = judged(id, conforming(id), EXIT[result]);
      assert.deepEqual(j.differences, [], id);
      assert.equal(j.conforms, true, id);
      const s = conforming(id);
      const mutations = {
        "no coverage": { ...s, coverage: undefined },
        "coverage not a list": { ...s, coverage: { [F1]: "covered" } },
        "an identifier left out": { ...s, coverage: s.coverage.slice(1) },
        "an identifier reported twice": { ...s, coverage: [...s.coverage, s.coverage[0]] },
        "an identifier the harness established none of": { ...s, coverage: [...s.coverage, { id: "acme/F8", state: "covered" }] },
        "an unnamed state": { ...s, coverage: s.coverage.map((e, i) => (i === 0 ? { ...e, state: "fine" } : e)) },
        ...Object.fromEntries(s.coverage.filter((e) => e.state !== "covered").map((e) => [`${e.id} reported covered`, { ...s, coverage: s.coverage.map((x) => (x.id === e.id ? { ...x, state: "covered" } : x)) }])),
        ...Object.fromEntries(s.coverage.filter((e) => e.state === "covered").map((e) => [`${e.id} reported allocated`, { ...s, coverage: s.coverage.map((x) => (x.id === e.id ? { ...x, state: "allocated" } : x)) }])),
      };
      for (const [why, m] of Object.entries(mutations)) assert.equal(judged(id, m, EXIT[result]).conforms, false, `${id}: ${why}`);
      for (const other of ["verified", "failed", "unknown"].filter((r) => r !== result)) {
        assert.equal(judged(id, claiming(s, other), EXIT[other]).conforms, false, `${id}: claiming ${other}`);
        assert.equal(judged(id, { ...claiming(s, other), coverage: s.coverage }, EXIT[result]).conforms, false, `${id}: claiming ${other} by its word alone`);
      }
    }
  });

  it("testing/T69 [testing/F55, testing/F45]: facts that do not realize a scenario never conform, and every observable testing/F45 compares is still compared", async () => {
    const { observe, judgeCoverage } = await contract();
    const verified = (id, facts, summary = conforming(id)) => judgeCoverage(id, observe(run(summary, 0), VERIFIER), facts).conforms;
    assert.equal(verified("coverage-allocated", FACTS, conforming("coverage-complete")), false, "facts with no allocation do not realize coverage-allocated");
    assert.equal(verified("coverage-unverified", FACTS, conforming("coverage-complete")), false, "facts with no unverified identifier do not realize coverage-unverified");
    assert.equal(verified("coverage-complete", factsFor("coverage-allocated"), conforming("coverage-allocated")), false, "facts with an allocation do not realize coverage-complete");
    const alsoMissing = with3([], [F2], [{ id: F3, allocated: ALLOCATION }]);
    const asAccounted = { ...conforming("coverage-allocated"), coverage: [{ id: F1, state: "uncovered" }, { id: F2, state: "covered" }, { id: F3, state: "allocated" }] };
    assert.equal(verified("coverage-allocated", alsoMissing, asAccounted), false, "facts that also leave an identifier uncovered make the run unknown, not coverage-allocated's verified");
    for (const k of ["identifiers", "model"]) assert.equal(verified("coverage-complete", { ...FACTS, [k]: undefined }), false, `no ${k} established`);
    assert.equal(verified("coverage-complete", FACTS, { ...conforming("coverage-complete"), digest: "e".repeat(64) }), false, "the digest is compared");
    assert.equal(verified("coverage-complete", FACTS, { ...conforming("coverage-complete"), cases: [{ name: T1, outcome: "pass" }] }), false, "every declared case is reported");
    assert.equal(judgeCoverage("clean", observe(run(conforming("coverage-complete"), 0), VERIFIER), FACTS).conforms, false, "a scenario of testing/F43 is not a coverage scenario");
    assert.equal(judgeCoverage("coverage-complete", { observation: null, findings: ["no summary line"] }, FACTS).conforms, false, "no observation never conforms");
  });
});
