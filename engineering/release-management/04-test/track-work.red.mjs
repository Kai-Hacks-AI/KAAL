// release-management/T38 to T43 (RED): `track Work` sorts each piece of Work into about to open, in stock or about to close per station.
// Carried unwired by the PLAN (00-changes/track-work-plan.md); the DO moves it next to the component, wires it into test:engineering
// and makes it GREEN. Run by hand from the repository root:
//
//   node --test engineering/release-management/04-test/track-work.red.mjs
//
// The Cases fail today because the component does not exist. Do not edit a Case to make it pass.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fromGraphql, render, trackWork } from "../05-src/track-work/track-work.mjs";

const HEAD = "a".repeat(40);
const pr = (change = {}) => ({
  kind: "pr", number: 7, title: "release-management/C7 DO: build track Work", headSha: HEAD, base: "kaal/engineering-release-management",
  behind: false, ci: "SUCCESS", unresolved: 0, approvedAtHead: false, autoMerge: true,
  envelope: "pass", ...change,
});
const one = (change, facts = {}) => trackWork({ prs: [pr(change)], branches: [], collectors: [], main: {}, ...facts }).work[0];

describe("release-management/T38 in stock (CTO): the Work cannot be reviewed yet", () => {
  for (const [name, change, wait] of [
    ["CI red", { ci: "FAILURE" }, /CI is red/],
    ["CI pending", { ci: "PENDING" }, /CI is pending/],
    ["behind its base", { behind: true }, /behind/],
    ["an unresolved conversation", { unresolved: 2 }, /2 unresolved/],
  ]) {
    it(name, () => {
      const w = one(change);
      assert.deepEqual([w.state, w.owner], ["in stock", "CTO"]);
      assert.ok(w.waitsOn.some((x) => wait.test(x)), w.waitsOn.join("; "));
    });
  }
});

describe("release-management/T39 the envelope is the verdict of the Envelope control, never a copy of its rule", () => {
  it("a failing verdict of the Envelope control puts the Work in stock", () => {
    const w = one({ envelope: "fail" });
    assert.deepEqual([w.state, w.owner], ["in stock", "CTO"]);
    assert.ok(w.waitsOn.some((x) => /envelope fails/.test(x)));
  });
  it("no verdict is reported as unknown and is provisional: it never puts the Work in stock and never counts as a pass", () => {
    const w = one({ envelope: "unknown" });
    assert.equal(w.state, "about to close");
    assert.equal(w.envelope, "unknown");
    assert.ok(w.waitsOn.some((x) => /envelope unknown \(provisional\)/.test(x)));
  });
  it("the component holds no checker of the title or commit form", () => {
    assert.equal(typeof trackWork, "function");
    assert.ok(!("checkEnvelope" in { trackWork }), "the envelope rule lives in its control only");
  });
});

describe("release-management/T40 about to close (CPO): reviewable with no approval at the head", () => {
  it("is the CPO's", () => {
    const w = one();
    assert.deepEqual([w.state, w.owner, w.station], ["about to close", "CPO", "12-collectors"]);
  });
  it("the station is read from the base: main is 11-main", () => {
    assert.equal(one({ base: "main", title: "Promote kaal/x into main: y" }).station, "11-main");
  });
});

describe("release-management/T41 approved at the head: queued, or the CTO's when auto-merge is off; a push sends it back", () => {
  it("approved with auto-merge on is nobody's", () => {
    const w = one({ approvedAtHead: true });
    assert.deepEqual([w.state, w.owner], ["queued", "nobody"]);
  });
  it("approved with auto-merge off is in stock", () => {
    const w = one({ approvedAtHead: true, autoMerge: false });
    assert.deepEqual([w.state, w.owner], ["in stock", "CTO"]);
    assert.ok(w.waitsOn.some((x) => /auto-merge/.test(x)));
  });
  it("a new push: approval no longer matches, CI pending is in stock, then green is about to close", () => {
    assert.equal(one({ approvedAtHead: false, ci: "PENDING" }).state, "in stock");
    assert.equal(one({ approvedAtHead: false, ci: "SUCCESS" }).state, "about to close");
  });
});

describe("release-management/T42 about to open (CTO): Work not yet opened", () => {
  it("a pushed branch with no pull request", () => {
    const r = trackWork({ prs: [], branches: [{ name: "claude/x", headSha: HEAD, base: "kaal/y" }], collectors: [], main: {} });
    assert.deepEqual([r.work[0].state, r.work[0].owner, r.work[0].ref], ["about to open", "CTO", "claude/x"]);
  });
  it("a collector ahead of main with no promotion pull request, and none when one is open", () => {
    const collector = { name: "kaal/mnemonics", headSha: HEAD, aheadOfMain: 3 };
    assert.equal(trackWork({ prs: [], branches: [], collectors: [collector], main: {} }).work[0].station, "11-main");
    const promo = pr({ base: "main", title: "Promote kaal/mnemonics into main: y" });
    assert.ok(!trackWork({ prs: [{ ...promo, head: "kaal/mnemonics" }], branches: [], collectors: [collector], main: {} }).work.some((w) => w.state === "about to open"));
  });
  it("main ahead of the last tag with no Release", () => {
    const w = trackWork({ prs: [], branches: [], collectors: [], main: { aheadOfLastTag: 4, headSha: HEAD, release: null } }).work[0];
    assert.deepEqual([w.station, w.state], ["10-npmjs", "about to open"]);
  });
});

describe("release-management/T43 --role filters, and the GraphQL answer maps to the input", () => {
  const facts = { prs: [pr(), pr({ number: 8, ci: "FAILURE" })], branches: [{ name: "claude/x", headSha: HEAD, base: "kaal/y" }], collectors: [], main: {} };
  it("cpo sees about to close only; cto sees about to open and in stock; the report refuses a call without a role", () => {
    assert.deepEqual(trackWork(facts, { role: "cpo" }).work.map((w) => w.state), ["about to close"]);
    assert.deepEqual(trackWork(facts, { role: "cto" }).work.map((w) => w.state).sort(), ["about to open", "in stock"]);
    assert.equal(trackWork(facts).work.length, 3, "the pure sorting returns every kind to its caller; it is not the report");
    assert.throws(() => render(trackWork(facts), {}), /--role/, "the report is role-facing: a call without a role is refused");
  });
  it("every line carries station, ref, C id, the full head SHA and what it waits on", () => {
    const w = trackWork(facts, { role: "cpo" }).work[0];
    assert.deepEqual([w.station, w.ref, w.changeId, w.headSha], ["12-collectors", "#7", "C7", HEAD]);
    assert.ok(Array.isArray(w.waitsOn));
  });
  const node = {
    number: 9, title: "release-management/C7 PLAN: x", headRefOid: HEAD, baseRefName: "kaal/x", mergeStateStatus: "BEHIND",
    autoMergeRequest: { enabledAt: "2026-11-10T10:00:00Z" },
    reviewThreads: { nodes: [{ isResolved: true }, { isResolved: false }] },
    latestReviews: { nodes: [{ state: "APPROVED", commit: { oid: "b".repeat(40) } }] },
    commits: { nodes: [{ commit: { oid: HEAD, statusCheckRollup: { state: "SUCCESS", contexts: { nodes: [{ name: "verify Envelope", conclusion: "SUCCESS" }] } } } }] },
  };
  it("maps head, base, behind, CI, threads, auto-merge; an approval of another commit does not count", () => {
    const p = fromGraphql(node);
    assert.deepEqual([p.number, p.headSha, p.base, p.behind, p.ci, p.unresolved, p.autoMerge, p.approvedAtHead], [9, HEAD, "kaal/x", true, "SUCCESS", 1, true, false]);
    assert.equal(fromGraphql({ ...node, latestReviews: { nodes: [{ state: "APPROVED", commit: { oid: HEAD } }] } }).approvedAtHead, true);
  });
  it("the Envelope verdict is read from its check: success is pass, failure is fail, absent is unknown", () => {
    assert.equal(fromGraphql(node).envelope, "pass");
    const n = structuredClone(node);
    n.commits.nodes[0].commit.statusCheckRollup.contexts.nodes[0].conclusion = "FAILURE";
    assert.equal(fromGraphql(n).envelope, "fail");
    n.commits.nodes[0].commit.statusCheckRollup.contexts.nodes = [];
    assert.equal(fromGraphql(n).envelope, "unknown");
  });
  it("a missing CI rollup is pending, not green", () => {
    const n = structuredClone(node);
    n.commits.nodes[0].commit.statusCheckRollup = null;
    assert.equal(fromGraphql(n).ci, "PENDING");
  });
});
