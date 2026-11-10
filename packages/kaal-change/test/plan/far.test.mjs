// change/C2 planned outer tests: FAR, Features Accepted Regression.
// Immutable to DO and CHECK; the DO Change turns them GREEN. Each title names
// the contracts it checks (plan/far/*.md). They use kaal-change's public
// interface only, give Plans as { plan, cases } and Testing's plan
// evaluations as plain data.
//
// Revised by the pre-DO test Change under the PLAN that authorizes Accepts by an
// accepted PLAN (#1342, change/I24, change/I25, change/F50-F54). That Change is a
// PLAN-type Change decided by the designated authority, and the revision is open:
// T10, T13-T16 and their shared fixtures follow the revised record (keyed to the
// Change and boundary, and to Case identities and digests, not revisions), and T60-T66
// are new. T9, T11 and T12 keep their assertions. A DO cannot edit this file.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** kaal-change/far, or the reason the tests are blocked before any behavioural assertion. */
async function far() {
  let mod;
  try {
    mod = await import("@kaihacksai/kaal-change/far");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-change exports no ./far (${e.code ?? e.message})`);
  }
  for (const name of ["proposal", "decide", "exceptions", "compose", "authorize", "approve", "integrity", "lifecycle"]) {
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

/** The integration Engineering names: the Change and the one boundary it serves. */
const INTEGRATION = Object.freeze({
  change: "sample/C7",
  boundary: { from: "change/sample-c7", into: "kaal/sample" },
});

/** What the gate establishes independently and gives as data (change/F50, change/F52). */
const dg = (id) => `sha256:${id}`;
const CONTEXT = Object.freeze({
  designation: "Owner",
  landing: "9a8b7c6",
  baseline: "3f2a1c9",
  head: "src-9c1e",
  digests: Object.freeze({ ...Object.fromEntries(range(1, 19).map((c) => [c, dg(c)])), "sample/T20": dg("sample/T20"), "sample/T21": dg("sample/T21") }),
  state: Object.freeze({ ended: Object.freeze({ "sample/T50": false }), authorizedCount: 5 }),
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

/** The authorization the PLAN established: the PLAN Change, the authority and the decision's evidence. */
const AUTHORIZATION = Object.freeze({ plan: "sample/C5", by: "Owner", evidence: "review on #900" });

/** A FAR record for INTEGRATION, with an optional Accept (authorization only with an Accept, change/F7). */
const record = (accept, over = {}) => ({
  integration: structuredClone(INTEGRATION),
  features: { plan: "sample/P7", cases: ["sample/T20", "sample/T21"].map((id) => ({ id, digest: dg(id) })) },
  regression: { plan: "sample/P1", cases: (accept ? accept.proposal.entries.map((e) => e.case) : []).map((id) => ({ id, digest: dg(id) })) },
  ...(accept ? { accept: { endsWhen: { judgedBy: "sample/T50" }, ...accept }, authorization: structuredClone(AUTHORIZATION) } : {}),
  ...over,
});

/** A plan evaluation as Testing reports it. */
const result = (over = {}) => ({ pass: true, green: [], red: [], excepted: [], missing: [], unobserved: [], notEstablished: [], stale: [], findings: [], ...over });

/** The findings whose text names every given word. */
const naming = (findings, ...words) => findings.filter((f) => words.every((w) => JSON.stringify(f).includes(w)));

/** Both evaluations for INTEGRATION: definitions read where change/F11 says, executed at the candidate's head. */
const evals = (regressionExceptions, over = {}) => ({
  features: { plan: "sample/P7", definedAt: CONTEXT.landing, at: CONTEXT.head, exceptions: [], result: result({ green: ["sample/T20", "sample/T21"] }), ...(over.features ?? {}) },
  regression: {
    plan: "sample/P1", definedAt: CONTEXT.baseline, at: CONTEXT.head, exceptions: regressionExceptions,
    result: result({ green: range(1, 19).filter((c) => c !== "sample/T12"), red: ["sample/T12"], excepted: ["sample/T12"] }),
    ...(over.regression ?? {}),
  },
});

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

  it("change/T10 [change/F9, change/F10]: accepting yields the Regression Plan's exceptions for every proposed Case, each citing the Change, its boundary and the authorizing PLAN", async () => {
    const { exceptions } = await far();
    const r = exceptions(record({ proposal: proposed(["sample/T15", "sample/T12"]), decision: decided("accept") }), INTEGRATION, PLANS, CONTEXT);
    assert.deepEqual(r.findings, []);
    assert.deepEqual(r.exceptions.map((x) => x.case), ["sample/T12", "sample/T15"], "every proposed Case, sorted");
    for (const x of r.exceptions) {
      assert.deepEqual(Object.keys(x).sort(), ["case", "cite"], "an exception is { case, cite }");
      for (const word of ["sample/C7", "kaal/sample", "sample/C5", "9a8b7c6", "Owner"]) assert.ok(x.cite.includes(word), `its cite names ${word}`);
    }
    const listed = exceptions(record({ proposal: proposed(), decision: decided("accept", { cases: ["sample/T12"] }) }), INTEGRATION, PLANS, CONTEXT);
    assert.deepEqual(listed.exceptions, [], "only narrow lists cases");
    assert.ok(naming(listed.findings, "cases").length > 0);
  });

  it("change/T11 [change/I7, change/F9, change/F10]: narrowing yields only its subset, and a subset that is empty, whole or reaches beyond the proposal yields nothing", async () => {
    const { decide, exceptions } = await far();
    const p = proposed(["sample/T11", "sample/T12", "sample/T13"]);
    const r = exceptions(record({ proposal: p, decision: decided("narrow", { cases: ["sample/T13", "sample/T11"] }) }), INTEGRATION, PLANS, CONTEXT);
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
      assert.deepEqual(exceptions(record({ proposal: proposed(), decision: decided(d) }), INTEGRATION, PLANS, CONTEXT).exceptions, []);
    }
    for (const [member, d] of [["by", decided("accept", { by: "" })], ["evidence", decided("accept", { evidence: "" })], ["decision", decided("waive")]]) {
      const r = decide(proposed(), d, PLANS);
      assert.equal(r.cases, null, `a decision with a malformed ${member} yields nothing`);
      assert.ok(naming(r.findings, member).length > 0, `and names ${member}`);
    }
    const r = exceptions(record({ proposal: { ...proposed(), alternatives: [] }, decision: decided("accept") }), INTEGRATION, PLANS, CONTEXT);
    assert.deepEqual(r.exceptions, [], "accepting a proposal with a finding yields nothing");
    assert.ok(naming(r.findings, "alternatives").length > 0);
  });

  it("change/T13 [change/I6, change/F11]: compose reports accepted Cases still RED, and finds an excepted Features evaluation and mismatched Regression exceptions", async () => {
    const { exceptions, compose } = await far();
    const rec = record({ proposal: proposed(), decision: decided("accept") });
    const granted = exceptions(rec, INTEGRATION, PLANS, CONTEXT).exceptions;
    const v = compose(rec, INTEGRATION, PLANS, evals(granted), CONTEXT);
    assert.deepEqual(v.findings, []);
    assert.equal(v.features.pass, true, "Features passes");
    assert.equal(v.regression.pass, true, "the Regression Plan passes under its authorized exception");
    assert.deepEqual(v.accepted, ["sample/T12"], "the accepted Case is reported, still RED");
    const failing = compose(rec, INTEGRATION, PLANS, evals(granted, { features: { result: result({ pass: false, green: ["sample/T20"], red: ["sample/T21"] }) } }), CONTEXT);
    assert.equal(failing.features.pass, false, "a RED Features Case fails Features");
    const excepted = compose(rec, INTEGRATION, PLANS, evals(granted, { features: { exceptions: [{ case: "sample/T21", cite: "any" }] } }), CONTEXT);
    assert.ok(naming(excepted.findings, "features", "sample/T21").length > 0, "Features is never evaluated with an exception");
    const widened = compose(rec, INTEGRATION, PLANS, evals([...granted, { case: "sample/T13", cite: granted[0].cite }]), CONTEXT);
    assert.ok(naming(widened.findings, "regression", "sample/T13").length > 0, "Regression exceptions beyond the Accept are a finding");
    const dropped = compose(rec, INTEGRATION, PLANS, evals([]), CONTEXT);
    assert.ok(naming(dropped.findings, "regression", "sample/T12").length > 0, "Regression exceptions short of the Accept are a finding");
  });

  it("change/T14 [change/N3, change/N4]: the same input gives the same result, the input is unchanged, and a record without an Accept yields no exceptions and composes from the two Plans alone", async () => {
    const { exceptions, compose } = await far();
    const rec = record({ proposal: proposed(["sample/T12", "sample/T13"]), decision: decided("narrow", { cases: ["sample/T13"] }) });
    const before = structuredClone(rec);
    assert.deepEqual(exceptions(rec, INTEGRATION, PLANS, CONTEXT), exceptions(structuredClone(rec), structuredClone(INTEGRATION), structuredClone(PLANS), structuredClone(CONTEXT)));
    assert.deepEqual(rec, before, "the input is not changed");
    const none = exceptions(record(), INTEGRATION, PLANS, CONTEXT);
    assert.deepEqual(none, { exceptions: [], findings: [] }, "no Accept, no exceptions, and no authorization is required");
    const v = compose(record(), INTEGRATION, PLANS, evals([], { regression: { result: result() } }), CONTEXT);
    assert.deepEqual(v.findings, []);
    assert.deepEqual(v.accepted, []);
  });

  it("change/T15 [change/I7, change/I24, change/F10]: exceptions never transfer to another Change or boundary, a different revision alone neither authorizes nor voids them, and a Case whose digest differs gets none", async () => {
    const { exceptions } = await far();
    const rec = record({ proposal: proposed(), decision: decided("accept") });
    const others = [
      ["sample/C8", { ...INTEGRATION, change: "sample/C8" }],
      ["main", { ...INTEGRATION, boundary: { ...INTEGRATION.boundary, into: "main" } }],
      ["change/other", { ...INTEGRATION, boundary: { ...INTEGRATION.boundary, from: "change/other" } }],
    ];
    for (const [word, integration] of others) {
      const r = exceptions(rec, integration, PLANS, CONTEXT);
      assert.deepEqual(r.exceptions, [], `an Accept for ${INTEGRATION.change} into ${INTEGRATION.boundary.into} yields nothing where ${word} differs`);
      assert.ok(naming(r.findings, word).length > 0, `and the finding names ${word}`);
    }
    assert.equal(exceptions(rec, INTEGRATION, PLANS, CONTEXT).exceptions.length, 1, "for its own integration it still applies");
    assert.equal(exceptions(rec, INTEGRATION, PLANS, { ...CONTEXT, head: "src-0000", baseline: "4b5d6e7" }).exceptions.length, 1, "a different source or baseline revision alone does not void it");
    const changed = { ...CONTEXT, digests: { ...CONTEXT.digests, "sample/T12": dg("sample/T12-edited") } };
    const r = exceptions(rec, INTEGRATION, PLANS, changed);
    assert.deepEqual(r.exceptions, [], "a Case whose digest differs from the record's gets no exception");
    assert.ok(naming(r.findings, "sample/T12").length > 0, "and the finding names it");
  });

  it("change/T16 [change/I5, change/F7, change/F11]: each Plan must be the one the record names: Features read at the PLAN's landing, Regression at the protected baseline, and each Case by identity and digest; a Case added to the target after the PLAN landed gets no exception", async () => {
    const { exceptions, compose } = await far();
    const rec = record({ proposal: proposed(), decision: decided("accept") });
    const granted = exceptions(rec, INTEGRATION, PLANS, CONTEXT).exceptions;
    const cases = [
      ["sample/P8", evals(granted, { features: { plan: "sample/P8" } }), "another Features Plan"],
      ["3f2a1c9", evals(granted, { features: { definedAt: "3f2a1c9" } }), "Features definitions read at the baseline instead of the PLAN's landing"],
      ["sample/P2", evals(granted, { regression: { plan: "sample/P2" } }), "another Regression Plan"],
      ["9a8b7c6", evals(granted, { regression: { definedAt: "9a8b7c6" } }), "Regression definitions read at the PLAN's landing instead of the protected baseline"],
      ["src-0000", evals(granted, { features: { at: "src-0000" } }), "Features executed at a head other than the candidate's"],
    ];
    for (const [word, evaluations, what] of cases) {
      assert.ok(naming(compose(rec, INTEGRATION, PLANS, evaluations, CONTEXT).findings, word).length > 0, `${what} is a finding naming ${word}`);
    }
    const stale = { ...rec, regression: { plan: "sample/P1", cases: [{ id: "sample/T12", digest: dg("older") }] } };
    const r = exceptions(stale, INTEGRATION, PLANS, CONTEXT);
    assert.deepEqual(r.exceptions, [], "a record whose Case digest is not the baseline's yields nothing");
    assert.ok(naming(r.findings, "sample/T12").length > 0);
    const grown = { ...CONTEXT, digests: { ...CONTEXT.digests, "sample/T30": dg("sample/T30") } };
    const added = exceptions(rec, INTEGRATION, { ...PLANS, regression: { ...PLANS.regression, cases: [...PLANS.regression.cases, "sample/T30"] } }, grown);
    assert.deepEqual(added.exceptions.map((x) => x.case), ["sample/T12"], "a Case the target gained after the PLAN landed is evaluated with no exception");
  });

  it("change/T60 [change/I24, change/F50]: without an authorization naming the exact PLAN and the designated authority, or without a verified landing given as data, there are no exceptions and a finding; a cite names the PLAN, the landing and the authority", async () => {
    const { exceptions, authorize } = await far();
    const base = record({ proposal: proposed(), decision: decided("accept") });
    const { authorization, ...bare } = base;
    for (const [what, rec, ctx, word] of [
      ["no authorization", bare, CONTEXT, "authorization"],
      ["an authorization without a PLAN", { ...base, authorization: { ...AUTHORIZATION, plan: "" } }, CONTEXT, "plan"],
      ["no verified landing", base, { ...CONTEXT, landing: undefined }, "landing"],
    ]) {
      const r = exceptions(rec, INTEGRATION, PLANS, ctx);
      assert.deepEqual(r.exceptions, [], `${what} yields nothing`);
      assert.ok(naming(r.findings, word).length > 0, `and the finding names ${word}`);
    }
    const ok = authorize(base, CONTEXT.designation, CONTEXT.landing);
    assert.deepEqual(ok.findings, []);
    for (const word of ["sample/C5", "9a8b7c6", "Owner"]) assert.ok(JSON.stringify(ok).includes(word), `the authorization result names ${word}`);
    assert.ok(!JSON.stringify(base).includes("9a8b7c6"), "the record itself holds no landing commit");
  });

  it("change/T61 [change/I24, change/F50, change/N3]: an authority other than the one given as data, or evidence that is not the decision's landing, authorizes nothing; a candidate-carried by and evidence are never self-authenticating; the designation is never read from the record", async () => {
    const { exceptions, authorize, approve } = await far();
    const base = record({ proposal: proposed(), decision: decided("accept") });
    const other = authorize({ ...base, authorization: { ...AUTHORIZATION, by: "Contributor" } }, CONTEXT.designation, CONTEXT.landing);
    assert.ok(naming(other.findings, "Contributor").length > 0, "an authority other than the designation authorizes nothing");
    const noEvidence = authorize({ ...base, authorization: { ...AUTHORIZATION, evidence: "" } }, CONTEXT.designation, CONTEXT.landing);
    assert.ok(naming(noEvidence.findings, "evidence").length > 0, "no evidence authorizes nothing");
    const self = exceptions({ ...base, designation: "Contributor", authorization: { ...AUTHORIZATION, by: "Contributor" } }, INTEGRATION, PLANS, CONTEXT);
    assert.deepEqual(self.exceptions, [], "a record that names its own designation and authority authorizes nothing");
    const decision = { plan: "sample/C5", head: "abc123", by: "Owner", evidence: "review on #900" };
    assert.deepEqual(approve({ plan: "sample/C5", head: "abc123" }, CONTEXT.designation, decision).findings, [], "a decision for the exact head by the designated authority");
    assert.ok(naming(approve({ plan: "sample/C5", head: "def456" }, CONTEXT.designation, decision).findings, "head").length > 0, "a decision for another head is not approval");
    const carried = approve({ plan: "sample/C5", head: "abc123", by: "Contributor", evidence: "me" }, CONTEXT.designation, undefined);
    assert.ok(carried.findings.length > 0, "a candidate that carries its own decision is not approved");
  });

  it("change/T62 [change/I25, change/F51]: a DO that removes, skips, marks or edits a PLAN's Case is a finding naming the Case, and so is an altered Accept or an Accept the PLAN did not establish, with or without an Accept", async () => {
    const { integrity } = await far();
    const established = { cases: [{ id: "sample/T20", digest: dg("sample/T20") }, { id: "sample/T21", digest: dg("sample/T21") }], accepts: [{ case: "sample/T12", decision: "accept" }] };
    assert.deepEqual(integrity(established, structuredClone(established)).findings, [], "unchanged is clean");
    const variants = [
      ["sample/T20", { ...established, cases: [established.cases[1]] }, "a removed Case"],
      ["sample/T21", { ...established, cases: [established.cases[0], { ...established.cases[1], skip: true }] }, "a skipped Case"],
      ["sample/T21", { ...established, cases: [established.cases[0], { ...established.cases[1], todo: true }] }, "a Case marked todo"],
      ["sample/T20", { ...established, cases: [{ ...established.cases[0], digest: dg("edited") }, established.cases[1]] }, "an edited Case"],
      ["sample/T12", { ...established, accepts: [{ case: "sample/T12", decision: "reject" }] }, "an altered Accept"],
      ["sample/T13", { ...established, accepts: [...established.accepts, { case: "sample/T13", decision: "accept" }] }, "an Accept the PLAN did not establish"],
    ];
    for (const [word, carried, what] of variants) assert.ok(naming(integrity(established, carried).findings, word).length > 0, `${what} is a finding naming ${word}`);
    const none = { cases: established.cases, accepts: [] };
    assert.ok(naming(integrity(none, { cases: [none.cases[0]], accepts: [] }).findings, "sample/T21").length > 0, "a removed Case is a finding when no Accept exists");
  });

  it("change/T63 [change/I25, change/F51]: a PLAN Change approved before landing by the designated authority for its exact head may change Cases and Accepts and is not judged as a DO; the same PLAN gives a DO no authorization until it has landed", async () => {
    const { approve, authorize } = await far();
    const decision = { plan: "sample/C5", head: "abc123", by: "Owner", evidence: "review on #900" };
    const r = approve({ plan: "sample/C5", head: "abc123", changesCases: true }, CONTEXT.designation, decision);
    assert.deepEqual(r.findings, [], "approved without a landing");
    assert.ok(!JSON.stringify(r).includes("integrity"), "and not judged by the DO integrity rules");
    const base = record({ proposal: proposed(), decision: decided("accept") });
    const unlanded = authorize(base, CONTEXT.designation, undefined);
    assert.ok(naming(unlanded.findings, "landing").length > 0, "authorization for a DO needs the verified landing");
  });

  it("change/T64 [change/I7, change/F52]: an Accept whose end condition has passed gives no exceptions and a finding; the outstanding count and conditions are reported; growth beyond the authorized count is a finding", async () => {
    const { exceptions, lifecycle } = await far();
    const rec = record({ proposal: proposed(["sample/T11", "sample/T12"]), decision: decided("accept") });
    const live = lifecycle(rec, { ended: { "sample/T50": false }, authorizedCount: 5 });
    assert.deepEqual(live.findings, []);
    assert.equal(live.outstanding, 2, "the outstanding count is reported");
    assert.ok(JSON.stringify(live.conditions).includes("sample/T50"), "and each end condition");
    const expired = { ...CONTEXT, state: { ended: { "sample/T50": true }, authorizedCount: 5 } };
    const r = exceptions(rec, INTEGRATION, PLANS, expired);
    assert.deepEqual(r.exceptions, [], "an expired Accept gives no exceptions");
    assert.ok(naming(r.findings, "sample/T50").length > 0, "and a finding naming its condition");
    const grown = lifecycle(rec, { ended: { "sample/T50": false }, authorizedCount: 1 });
    assert.ok(grown.findings.length > 0, "growth beyond the authorized count is a finding");
  });

  it("change/T65 [change/I24, change/F53]: an Accept serves one Change into one boundary; the same weakening at another boundary has no exception until it has its own authorized entry, and a PLAN in history or an Accept for a collector integration authorizes nothing at main", async () => {
    const { exceptions } = await far();
    const rec = record({ proposal: proposed(), decision: decided("accept") });
    const promotion = { ...INTEGRATION, boundary: { from: "kaal/sample", into: "main" } };
    const r = exceptions(rec, promotion, PLANS, CONTEXT);
    assert.deepEqual(r.exceptions, [], "the collector Accept does not carry into main");
    assert.ok(naming(r.findings, "main").length > 0, "and the finding names the boundary");
    const own = record({ proposal: proposed(), decision: decided("accept") }, { integration: structuredClone(promotion) });
    assert.equal(exceptions(own, promotion, PLANS, CONTEXT).exceptions.length, 1, "an entry naming the promotion boundary, authorized by a PLAN, applies there");
  });

  it("change/T66 [change/I25, change/F54]: an unreadable record, an untraceable entry, an unverifiable authority and a condition that cannot be judged each give no exceptions, a finding naming which, and no passing compose", async () => {
    const { exceptions, compose } = await far();
    const base = record({ proposal: proposed(), decision: decided("accept") });
    const granted = exceptions(base, INTEGRATION, PLANS, CONTEXT).exceptions;
    const unreadable = exceptions(null, INTEGRATION, PLANS, CONTEXT);
    assert.deepEqual(unreadable.exceptions, [], "an unreadable record gives none");
    assert.ok(unreadable.findings.length > 0);
    const untraceable = exceptions({ ...base, authorization: { ...AUTHORIZATION, plan: "sample/C404" } }, INTEGRATION, PLANS, { ...CONTEXT, landing: "unknown" });
    assert.deepEqual(untraceable.exceptions, [], "an entry that cannot be traced to its PLAN gives none");
    assert.ok(naming(untraceable.findings, "sample/C404").length > 0);
    const unverifiable = exceptions(base, INTEGRATION, PLANS, { ...CONTEXT, designation: undefined });
    assert.deepEqual(unverifiable.exceptions, [], "an authority that cannot be verified gives none");
    assert.ok(naming(unverifiable.findings, "designation").length > 0);
    for (const state of [{ authorizedCount: 5 }, { ended: {}, authorizedCount: 5 }]) {
      const unjudged = exceptions(base, INTEGRATION, PLANS, { ...CONTEXT, state });
      assert.deepEqual(unjudged.exceptions, [], `a condition that cannot be judged gives none (${JSON.stringify(state)})`);
      assert.ok(naming(unjudged.findings, "sample/T50").length > 0);
    }
    const v = compose(base, INTEGRATION, PLANS, evals(granted), { ...CONTEXT, designation: undefined });
    assert.ok(v.findings.length > 0 && v.regression.pass !== true, "and compose gives no passing outcome");
  });
});
