// change/C2 planned outer tests: FAR, Features Accepted Regression.
// Immutable to DO and CHECK; the DO Change turns them GREEN. Each title names
// the contracts it checks (plan/far/*.md). They use kaal-change's public
// interface only, give Plans as { plan, cases } and Testing's plan
// evaluations as plain data.
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
  for (const name of ["proposal", "decide", "exceptions", "compose"]) {
    assert.equal(typeof mod[name], "function", `blocked before behavioural assertion: kaal-change/far exports no ${name}`);
  }
  return mod;
}

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => `sample/T${from + i}`);

/** The incoming Change's Features Plan and the target's Regression Plan. */
const PLANS = Object.freeze({
  features: { plan: "sample/P7", cases: ["sample/T20", "sample/T21"] },
  regression: { plan: "sample/P1", cases: range(1, 19) },
});

/** The integration Engineering names: its revisions are evidence Change only compares. */
const INTEGRATION = Object.freeze({
  source: { change: "sample/C7", revision: "src-9c1e" },
  target: { name: "kaal/sample", baseline: "3f2a1c9" },
});

/** A well-formed proposal leaving `cases` of the Regression Plan RED, justified by sample/T20. */
const proposed = (cases = ["sample/T12"]) => ({
  intent: "sample/I3",
  entries: cases.map((c) => ({ case: c, justifiedBy: ["sample/T20"], protects: `commitment of ${c}` })),
  reason: "the export reorders the shared columns",
  alternatives: ["a stable-order flag"],
});

/** A well-formed decision. */
const decided = (decision, extra = {}) => ({ decision, by: "Owner", evidence: "review on #900", ...extra });

/** A FAR record for INTEGRATION, with an optional Accept. */
const record = (accept) => ({
  integration: structuredClone(INTEGRATION),
  features: { plan: "sample/P7", at: "src-9c1e" },
  regression: { plan: "sample/P1", at: "3f2a1c9" },
  ...(accept ? { accept } : {}),
});

/** A plan evaluation as Testing reports it. */
const result = (over = {}) => ({ pass: true, green: [], red: [], excepted: [], missing: [], unobserved: [], notEstablished: [], stale: [], findings: [], ...over });

/** The findings whose text names every given word. */
const naming = (findings, ...words) => findings.filter((f) => words.every((w) => JSON.stringify(f).includes(w)));

describe("FAR, Features Accepted Regression (change/C2)", () => {
  it("change/T9 [change/I6, change/F8]: a well-formed proposal has no findings, and each identity or member it breaks is a finding naming it", async () => {
    const { proposal } = await far();
    assert.deepEqual(proposal(proposed(), PLANS).findings, [], "a well-formed proposal");
    const p = proposed();
    const e = p.entries[0];
    const broken = [
      ["sample/T40", { ...p, entries: [{ ...e, case: "sample/T40" }] }, "a Case not in the Regression Plan"],
      ["sample/T21", { ...p, entries: [{ ...e, case: "sample/T21" }] }, "a Case in the Features Plan"],
      ["justifiedBy", { ...p, entries: [{ ...e, justifiedBy: [] }] }, "an empty justification"],
      ["sample/T3", { ...p, entries: [{ ...e, justifiedBy: ["sample/T3"] }] }, "a justification outside the Features Plan"],
      ["sample/T12", { ...p, entries: [e, { ...e }] }, "a Case listed twice"],
      ["protects", { ...p, entries: [{ ...e, protects: "" }] }, "an empty protects"],
      ["entries", { ...p, entries: [] }, "no entries"],
      ["intent", { ...p, intent: "" }, "an empty intent"],
      ["reason", { ...p, reason: "" }, "an empty reason"],
      ["alternatives", { ...p, alternatives: [] }, "no alternatives"],
    ];
    for (const [word, value, what] of broken) {
      assert.ok(naming(proposal(value, PLANS).findings, word).length > 0, `${what} is a finding naming ${word}`);
    }
    const { reason, ...missing } = p;
    assert.ok(naming(proposal(missing, PLANS).findings, "reason").length > 0, "a missing member is a finding");
  });

  it("change/T10 [change/F9, change/F10]: accepting yields the Regression Plan's exceptions for every proposed Case, each citing the Change and its integration", async () => {
    const { exceptions } = await far();
    const r = exceptions(record({ proposal: proposed(["sample/T15", "sample/T12"]), decision: decided("accept") }), INTEGRATION, PLANS);
    assert.deepEqual(r.findings, []);
    assert.deepEqual(r.exceptions.map((x) => x.case), ["sample/T12", "sample/T15"], "every proposed Case, sorted");
    for (const x of r.exceptions) {
      assert.deepEqual(Object.keys(x).sort(), ["case", "cite"], "an exception is { case, cite }");
      for (const word of ["sample/C7", "kaal/sample", "3f2a1c9"]) assert.ok(x.cite.includes(word), `its cite names ${word}`);
    }
    const listed = exceptions(record({ proposal: proposed(), decision: decided("accept", { cases: ["sample/T12"] }) }), INTEGRATION, PLANS);
    assert.deepEqual(listed.exceptions, [], "only narrow lists cases");
    assert.ok(naming(listed.findings, "cases").length > 0);
  });

  it("change/T11 [change/I7, change/F9, change/F10]: narrowing yields only its subset, and a subset that is empty, whole or reaches beyond the proposal yields nothing", async () => {
    const { decide, exceptions } = await far();
    const p = proposed(["sample/T11", "sample/T12", "sample/T13"]);
    const r = exceptions(record({ proposal: p, decision: decided("narrow", { cases: ["sample/T13", "sample/T11"] }) }), INTEGRATION, PLANS);
    assert.deepEqual(r.findings, []);
    assert.deepEqual(r.exceptions.map((x) => x.case), ["sample/T11", "sample/T13"]);
    for (const cases of [[], ["sample/T11", "sample/T12", "sample/T13"], ["sample/T11", "sample/T9"], undefined]) {
      const bad = decide(p, decided("narrow", cases === undefined ? {} : { cases }), PLANS);
      assert.equal(bad.cases, null, `narrowing to ${JSON.stringify(cases)} yields nothing`);
      assert.ok(bad.findings.length > 0, "and is a finding");
    }
    assert.ok(naming(decide(p, decided("narrow", { cases: ["sample/T9"] }), PLANS).findings, "sample/T9").length > 0, "a Case beyond the proposal is named");
  });

  it("change/T12 [change/I7, change/F9, change/F10]: rejecting and redesigning yield nothing, and neither does a decision without authority or evidence, or a proposal with a finding", async () => {
    const { decide, exceptions } = await far();
    for (const d of ["reject", "redesign"]) {
      const r = decide(proposed(), decided(d), PLANS);
      assert.deepEqual(r.findings, [], `${d} is a well-formed decision`);
      assert.equal(r.cases, null, `${d} yields nothing`);
      assert.deepEqual(exceptions(record({ proposal: proposed(), decision: decided(d) }), INTEGRATION, PLANS).exceptions, []);
    }
    for (const [member, d] of [["by", decided("accept", { by: "" })], ["evidence", decided("accept", { evidence: "" })], ["decision", decided("waive")]]) {
      const r = decide(proposed(), d, PLANS);
      assert.equal(r.cases, null, `a decision with a malformed ${member} yields nothing`);
      assert.ok(naming(r.findings, member).length > 0, `and names ${member}`);
    }
    const r = exceptions(record({ proposal: { ...proposed(), alternatives: [] }, decision: decided("accept") }), INTEGRATION, PLANS);
    assert.deepEqual(r.exceptions, [], "accepting a proposal with a finding yields nothing");
    assert.ok(naming(r.findings, "alternatives").length > 0);
  });

  it("change/T13 [change/I6, change/F11]: compose reports accepted Cases still RED, and finds an excepted Features evaluation and mismatched Regression exceptions", async () => {
    const { exceptions, compose } = await far();
    const rec = record({ proposal: proposed(), decision: decided("accept") });
    const granted = exceptions(rec, INTEGRATION, PLANS).exceptions;
    const features = { plan: "sample/P7", at: "src-9c1e", exceptions: [], result: result({ green: ["sample/T20", "sample/T21"] }) };
    const regression = { plan: "sample/P1", at: "3f2a1c9", exceptions: granted, result: result({ green: range(1, 19).filter((c) => c !== "sample/T12"), red: ["sample/T12"], excepted: ["sample/T12"] }) };
    const v = compose(rec, INTEGRATION, PLANS, { features, regression });
    assert.deepEqual(v.findings, []);
    assert.equal(v.features.pass, true, "Features passes");
    assert.equal(v.regression.pass, true, "the Regression Plan passes under its authorized exception");
    assert.deepEqual(v.accepted, ["sample/T12"], "the accepted Case is reported, still RED");
    const failing = compose(rec, INTEGRATION, PLANS, { features: { ...features, result: result({ pass: false, green: ["sample/T20"], red: ["sample/T21"] }) }, regression });
    assert.equal(failing.features.pass, false, "a RED Features Case fails Features");
    const excepted = compose(rec, INTEGRATION, PLANS, { features: { ...features, exceptions: [{ case: "sample/T21", cite: "any" }] }, regression });
    assert.ok(naming(excepted.findings, "features", "sample/T21").length > 0, "Features is never evaluated with an exception");
    const widened = compose(rec, INTEGRATION, PLANS, { features, regression: { ...regression, exceptions: [...granted, { case: "sample/T13", cite: granted[0].cite }] } });
    assert.ok(naming(widened.findings, "regression", "sample/T13").length > 0, "Regression exceptions beyond the Accept are a finding");
    const dropped = compose(rec, INTEGRATION, PLANS, { features, regression: { ...regression, exceptions: [] } });
    assert.ok(naming(dropped.findings, "regression", "sample/T12").length > 0, "Regression exceptions short of the Accept are a finding");
  });

  it("change/T14 [change/N3, change/N4]: the same input gives the same result, the input is unchanged, and a record without an Accept yields no exceptions", async () => {
    const { exceptions, compose } = await far();
    const rec = record({ proposal: proposed(["sample/T12", "sample/T13"]), decision: decided("narrow", { cases: ["sample/T13"] }) });
    const before = structuredClone(rec);
    assert.deepEqual(exceptions(rec, INTEGRATION, PLANS), exceptions(structuredClone(rec), structuredClone(INTEGRATION), structuredClone(PLANS)));
    assert.deepEqual(rec, before, "the input is not changed");
    const none = exceptions(record(), INTEGRATION, PLANS);
    assert.deepEqual(none, { exceptions: [], findings: [] }, "no Accept, no exceptions");
    const v = compose(record(), INTEGRATION, PLANS, {
      features: { plan: "sample/P7", at: "src-9c1e", exceptions: [], result: result() },
      regression: { plan: "sample/P1", at: "3f2a1c9", exceptions: [], result: result() },
    });
    assert.deepEqual(v.findings, []);
    assert.deepEqual(v.accepted, []);
  });

  it("change/T15 [change/I7, change/F10]: exceptions never transfer to another integration, whether its source Change, source revision, target or baseline differs", async () => {
    const { exceptions } = await far();
    const rec = record({ proposal: proposed(), decision: decided("accept") });
    const others = [
      ["sample/C8", { ...INTEGRATION, source: { ...INTEGRATION.source, change: "sample/C8" } }],
      ["src-0000", { ...INTEGRATION, source: { ...INTEGRATION.source, revision: "src-0000" } }],
      ["main", { ...INTEGRATION, target: { ...INTEGRATION.target, name: "main" } }],
      ["4b5d6e7", { ...INTEGRATION, target: { ...INTEGRATION.target, baseline: "4b5d6e7" } }],
    ];
    for (const [word, integration] of others) {
      const r = exceptions(rec, integration, PLANS);
      assert.deepEqual(r.exceptions, [], `an Accept for ${INTEGRATION.target.name}@${INTEGRATION.target.baseline} yields nothing where ${word} differs`);
      assert.ok(naming(r.findings, word).length > 0, `and the finding names ${word}`);
    }
    assert.equal(exceptions(rec, INTEGRATION, PLANS).exceptions.length, 1, "for its own integration it still applies");
  });

  it("change/T16 [change/I5, change/F7, change/F11]: each Plan must be the one the record names, read at its revision: Features at the source's, Regression at the baseline", async () => {
    const { exceptions, compose } = await far();
    const rec = record({ proposal: proposed(), decision: decided("accept") });
    const granted = exceptions(rec, INTEGRATION, PLANS).exceptions;
    const features = { plan: "sample/P7", at: "src-9c1e", exceptions: [], result: result() };
    const regression = { plan: "sample/P1", at: "3f2a1c9", exceptions: granted, result: result({ red: ["sample/T12"], excepted: ["sample/T12"] }) };
    const cases = [
      ["sample/P8", { features: { ...features, plan: "sample/P8" }, regression }, "another Features Plan"],
      ["3f2a1c9", { features: { ...features, at: "3f2a1c9" }, regression }, "Features read at the baseline"],
      ["sample/P2", { features, regression: { ...regression, plan: "sample/P2" } }, "another Regression Plan"],
      ["src-9c1e", { features, regression: { ...regression, at: "src-9c1e" } }, "Regression read at the source"],
    ];
    for (const [word, evaluations, what] of cases) {
      assert.ok(naming(compose(rec, INTEGRATION, PLANS, evaluations).findings, word).length > 0, `${what} is a finding naming ${word}`);
    }
    const stale = { ...rec, regression: { plan: "sample/P1", at: "older" } };
    const r = exceptions(stale, INTEGRATION, PLANS);
    assert.deepEqual(r.exceptions, [], "a record whose Regression Plan is not read at the baseline yields nothing");
    assert.ok(naming(r.findings, "regression", "older").length > 0);
    const early = { ...rec, features: { plan: "sample/P7", at: "src-0000" } };
    assert.ok(naming(exceptions(early, INTEGRATION, PLANS).findings, "features", "src-0000").length > 0, "nor one whose Features Plan is not read at the source's revision");
  });
});
