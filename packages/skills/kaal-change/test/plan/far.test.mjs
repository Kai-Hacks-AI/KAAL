// change/C2 planned outer tests: Features Accept Regression.
// Immutable to DO and CHECK; the DO Change turns them GREEN. Each title names
// the contracts it checks (plan/far/*.md). They use kaal-change's public
// interface only.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** kaal-change/far, or the reason the tests are blocked before any behavioural assertion. */
async function far() {
  let mod;
  try {
    mod = await import("kaal-change/far");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-change exports no ./far (${e.code ?? e.message})`);
  }
  for (const name of ["proposal", "decide", "outcomes"]) {
    assert.equal(typeof mod[name], "function", `blocked before behavioural assertion: kaal-change/far exports no ${name}`);
  }
  return mod;
}

/** A well-formed proposal by `change`, leaving `tests` RED. */
const proposed = (change = "sample/C2", tests = ["sample/T3", "sample/T1"]) => ({
  change,
  intent: "sample/I1",
  tests: tests.map((test, i) => ({ test, class: i % 2 ? "missing" : "regression", protects: `commitment of ${test}` })),
  reason: "the Feature and the established behavior cannot both hold",
  alternatives: ["a Feature flag", "a narrower Feature"],
});

/** A well-formed decision. */
const decided = (decision, extra = {}) => ({ decision, by: "Owner", evidence: "review 1", ...extra });

/** The findings whose text names every given word. */
const naming = (findings, ...words) => findings.filter((f) => words.every((w) => JSON.stringify(f).includes(w)));

describe("Features Accept Regression (change/C2)", () => {
  it("change/T9 [change/I6, change/F7]: a well-formed proposal has no findings, and each malformed member is a finding naming it", async () => {
    const { proposal } = await far();
    assert.deepEqual(proposal(proposed()).findings, [], "a well-formed proposal");
    const p = proposed();
    const broken = {
      change: { ...p, change: "sample/c2" },
      intent: { ...p, intent: "" },
      tests: { ...p, tests: [] },
      test: { ...p, tests: [{ ...p.tests[0], test: "sample/F1" }] },
      class: { ...p, tests: [{ ...p.tests[0], class: "feature" }] },
      protects: { ...p, tests: [{ ...p.tests[0], protects: "" }] },
      reason: { ...p, reason: "" },
      alternatives: { ...p, alternatives: [] },
    };
    for (const [member, value] of Object.entries(broken)) {
      assert.ok(naming(proposal(value).findings, member).length > 0, `a malformed ${member} is a finding naming it`);
    }
    for (const cls of ["persisting", "unknown", "unidentified"]) {
      assert.ok(naming(proposal({ ...p, tests: [{ ...p.tests[0], class: cls }] }).findings, cls).length > 0, `${cls} cannot be proposed`);
    }
    const twice = { ...p, tests: [p.tests[0], { ...p.tests[0] }] };
    assert.ok(naming(proposal(twice).findings, p.tests[0].test).length > 0, "a Test Case listed twice is a finding");
    const { reason, ...missing } = p;
    assert.ok(naming(proposal(missing).findings, "reason").length > 0, "a missing member is a finding");
  });

  it("change/T10 [change/F8, change/F9]: accepting yields exactly { change, tests } with every proposed Test Case, sorted", async () => {
    const { decide } = await far();
    const r = decide(proposed(), decided("accept"));
    assert.deepEqual(r.findings, []);
    assert.deepEqual(r.outcome, { change: "sample/C2", tests: ["sample/T1", "sample/T3"] }, "the outcome is Testing's shape and nothing more");
    const listed = decide(proposed(), decided("accept", { tests: ["sample/T1"] }));
    assert.equal(listed.outcome, null, "only narrow lists tests");
    assert.ok(naming(listed.findings, "tests").length > 0);
  });

  it("change/T11 [change/I7, change/F8, change/F9]: narrowing yields only its subset, and a subset that is empty, whole or reaches beyond the proposal yields nothing", async () => {
    const { decide } = await far();
    const p = proposed("sample/C2", ["sample/T1", "sample/T2", "sample/T3"]);
    const r = decide(p, decided("narrow", { tests: ["sample/T3", "sample/T1"] }));
    assert.deepEqual(r.findings, []);
    assert.deepEqual(r.outcome, { change: "sample/C2", tests: ["sample/T1", "sample/T3"] });
    for (const tests of [[], ["sample/T1", "sample/T2", "sample/T3"], ["sample/T1", "sample/T9"], undefined]) {
      const bad = decide(p, decided("narrow", tests === undefined ? {} : { tests }));
      assert.equal(bad.outcome, null, `narrowing to ${JSON.stringify(tests)} yields nothing`);
      assert.ok(bad.findings.length > 0, "and is a finding");
    }
    assert.ok(naming(decide(p, decided("narrow", { tests: ["sample/T9"] })).findings, "sample/T9").length > 0, "a Test Case beyond the proposal is named");
  });

  it("change/T12 [change/I7, change/F8, change/F9]: rejecting and redesigning yield nothing, and neither does a decision without authority or evidence, or a proposal with a finding", async () => {
    const { decide } = await far();
    for (const d of ["reject", "redesign"]) {
      const r = decide(proposed(), decided(d));
      assert.deepEqual(r.findings, [], `${d} is a well-formed decision`);
      assert.equal(r.outcome, null, `${d} yields nothing`);
    }
    for (const [member, d] of [["by", decided("accept", { by: "" })], ["evidence", decided("accept", { evidence: "" })], ["decision", decided("waive")]]) {
      const r = decide(proposed(), d);
      assert.equal(r.outcome, null, `a decision with a malformed ${member} yields nothing`);
      assert.ok(naming(r.findings, member).length > 0, `and names ${member}`);
    }
    const r = decide({ ...proposed(), alternatives: [] }, decided("accept"));
    assert.equal(r.outcome, null, "accepting a proposal with a finding yields nothing");
    assert.ok(naming(r.findings, "alternatives").length > 0);
  });

  it("change/T13 [change/I8, change/F10]: decided proposals assemble into one far list sorted by Change, and two decisions for one Change hand on neither", async () => {
    const { outcomes } = await far();
    const r = outcomes([
      { proposal: proposed("z/C9", ["z/T2"]), decision: decided("accept") },
      { proposal: proposed("a/C4", ["a/T1", "a/T2"]), decision: decided("narrow", { tests: ["a/T2"] }) },
      { proposal: proposed("m/C1"), decision: decided("reject") },
    ]);
    assert.deepEqual(r.findings, []);
    assert.deepEqual(r.far, [{ change: "a/C4", tests: ["a/T2"] }, { change: "z/C9", tests: ["z/T2"] }]);
    const twice = outcomes([
      { proposal: proposed("a/C4"), decision: decided("accept") },
      { proposal: proposed("a/C4"), decision: decided("reject") },
      { proposal: proposed("b/C1", ["b/T1"]), decision: decided("accept") },
    ]);
    assert.ok(naming(twice.findings, "a/C4").length > 0, "two decisions for one Change are a finding");
    assert.deepEqual(twice.far, [{ change: "b/C1", tests: ["b/T1"] }], "neither is handed on, the others are");
    const bad = outcomes([{ proposal: { ...proposed("c/C1"), reason: "" }, decision: decided("accept") }]);
    assert.ok(naming(bad.findings, "c/C1", "reason").length > 0, "findings are reported with their Change");
    assert.deepEqual(bad.far, []);
  });

  it("change/T14 [change/N3, change/N4]: the same input gives the same result, the input is unchanged, and no decisions give an empty list", async () => {
    const { decide, outcomes } = await far();
    const input = [{ proposal: proposed(), decision: decided("narrow", { tests: ["sample/T3"] }) }];
    const before = structuredClone(input);
    assert.deepEqual(outcomes(input), outcomes(structuredClone(input)));
    assert.deepEqual(decide(input[0].proposal, input[0].decision), decide(input[0].proposal, input[0].decision));
    assert.deepEqual(input, before, "the input is not changed");
    assert.deepEqual(outcomes([]), { far: [], findings: [] });
  });
});
