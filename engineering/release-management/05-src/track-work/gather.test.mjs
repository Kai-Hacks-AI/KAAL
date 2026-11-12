// release-management/T44 and T45 (C7, C15): what cannot be read is shown as a gap, the facts are gathered without writing anything, and the GraphQL answer maps to them.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { gather } from "./gather.mjs";
import { ciOf, fromGraphql, render, trackWork } from "./track-work.mjs";

// A consumer that is not KAAL.
const MODEL = {
  defaultBranch: "trunk", integrationPrefix: "int/", checks: { envelope: "lint Pull Request" },
  waits: [{ name: "pull-request", any: ["noPullRequest"] }, { name: "fix", any: ["ciRed", "ciPending", "behind", "unresolved", "envelopeFails"] }, { name: "approval", any: ["notApprovedAtHead"] }, { name: "fix", any: ["autoMergeOff"] }, { name: "merge", any: [] }],
  provisional: ["envelopeFails"],
  positions: { branch: { stage: "Draft", station: null }, change: { stage: "Review", station: "R1" }, promotion: { stage: "Ship", station: "S1" }, release: { stage: "Live", station: "L1" } },
};

const SHA = "c".repeat(40);
const node = (number, base) => ({
  number, title: `C7 DO: x${number}`, headRefName: `h${number}`, headRefOid: SHA, baseRefName: base, mergeStateStatus: "CLEAN", autoMergeRequest: null,
  reviewThreads: { pageInfo: { hasNextPage: false }, nodes: [] }, latestReviews: { nodes: [] },
  commits: { nodes: [{ commit: { oid: SHA, statusCheckRollup: { state: "SUCCESS", contexts: { nodes: [] } } } }] },
});
const fake = (more = false) => async (a) => {
  if (a[0] === "graphql") {
    const q = a.find((x) => x.startsWith("query="));
    if (q.includes("pullRequests(")) return { data: { repository: { pullRequests: { pageInfo: { hasNextPage: more }, nodes: [node(1, "int/x")] } } } };
    return { data: { repository: { refs: { pageInfo: { hasNextPage: false }, nodes: [
      { name: "trunk", target: { oid: SHA }, associatedPullRequests: { totalCount: 0 } },
      { name: "int/x", target: { oid: SHA }, associatedPullRequests: { totalCount: 5 } },
      { name: "claude/lonely", target: { oid: SHA }, associatedPullRequests: { totalCount: 0 } },
      { name: "claude/done", target: { oid: SHA }, associatedPullRequests: { totalCount: 1 } },
    ] } } } };
  }
  assert.ok(!a.includes("-X") && !a.includes("--method"), "gathering writes nothing");
  if (a[0].includes("/compare/trunk...int/x")) return { ahead_by: 2 };
  if (a[0].endsWith("/commits/trunk")) return { sha: SHA };
  if (a[0].includes("/releases")) return [];
  throw new Error(`unexpected read ${a[0]}`);
};

describe("release-management/T44 gathering is read-only and shows what it could not read", () => {
  it("maps pull requests, a branch with no pull request and a collector ahead of main", async () => {
    const f = await gather(fake(), "O/R", MODEL);
    assert.deepEqual([f.prs.length, f.branches.map((b) => b.name), f.collectors.map((c) => [c.name, c.aheadOfMain])], [1, ["claude/lonely"], [["int/x", 2]]]);
  });
  it("lists the unread: the npm deployment request, no Release, and a page limit", async () => {
    const f = await gather(fake(true), "O/R", MODEL);
    assert.ok(f.gaps.some((g) => /deployment request/.test(g)));
    assert.ok(f.gaps.some((g) => /no Release/.test(g)));
    assert.ok(f.gaps.some((g) => /more open pull requests than were read/.test(g)));
  });
  it("the report prints the gaps after the lines, never an empty report that looks complete", async () => {
    const out = render(trackWork(await gather(fake(), "O/R", MODEL), { model: MODEL }));
    assert.match(out, /claude\/lonely/);
    assert.match(out, /incomplete: L1: the deployment request/);
  });
});

describe("release-management/T45 CI is read per check from its newest run", () => {
  const run = (name, conclusion, startedAt, status = "COMPLETED") => ({ name, conclusion, startedAt, status });
  it("an older failed run superseded by a later success of the same check is not red", () => {
    const nodes = [run("Branching", "FAILURE", "2026-11-10T10:55:57Z"), run("Branching", "SUCCESS", "2026-11-10T10:56:14Z"), run("Engineering", "SUCCESS", "2026-11-10T10:55:57Z")];
    assert.equal(ciOf({ state: "FAILURE", contexts: { nodes } }), "SUCCESS");
  });
  it("a failure that is the newest run of its check is red, and a run still going is pending", () => {
    assert.equal(ciOf({ state: "SUCCESS", contexts: { nodes: [run("Branching", "SUCCESS", "a"), run("Branching", "FAILURE", "b")] } }), "FAILURE");
    assert.equal(ciOf({ state: "SUCCESS", contexts: { nodes: [run("Engineering", null, "a", "IN_PROGRESS")] } }), "PENDING");
  });
  it("without contexts, or with more than one page of them, GitHub's own rollup state is used", () => {
    assert.equal(ciOf({ state: "FAILURE" }), "FAILURE");
    assert.equal(ciOf({ state: "FAILURE", contexts: { pageInfo: { hasNextPage: true }, nodes: [run("A", "SUCCESS", "a")] } }), "FAILURE");
    assert.equal(ciOf(null), "PENDING");
  });
});

describe("release-management/T44 the GraphQL answer maps to the facts, by the check the model names", () => {
  const HEAD = "b".repeat(40);
  const node = {
    number: 9, title: "T-9 x", headRefOid: HEAD, baseRefName: "int/x", mergeStateStatus: "BEHIND",
    autoMergeRequest: { enabledAt: "2026-11-10T10:00:00Z" },
    files: { nodes: [{ path: "a.md" }, { path: "b.md" }] },
    reviewThreads: { nodes: [{ isResolved: true }, { isResolved: false }] },
    latestReviews: { nodes: [{ state: "APPROVED", commit: { oid: "c".repeat(40) } }] },
    commits: { nodes: [{ commit: { oid: HEAD, statusCheckRollup: { state: "SUCCESS", contexts: { nodes: [{ name: "lint Pull Request", conclusion: "SUCCESS" }] } } } }] },
  };
  it("maps head, base, behind, CI, threads, paths and auto-merge; an approval of another commit does not count", () => {
    const p = fromGraphql(node, MODEL);
    assert.deepEqual([p.number, p.headSha, p.base, p.behind, p.ci, p.unresolved, p.autoMerge, p.approvedAtHead, p.paths], [9, HEAD, "int/x", true, "SUCCESS", 1, true, false, ["a.md", "b.md"]]);
    assert.equal(fromGraphql({ ...node, latestReviews: { nodes: [{ state: "APPROVED", commit: { oid: HEAD } }] } }, MODEL).approvedAtHead, true);
  });
  it("the envelope verdict is read from the named check: success is pass, failure is fail, absent is unknown", () => {
    assert.equal(fromGraphql(node, MODEL).envelope, "pass");
    const n = structuredClone(node);
    n.commits.nodes[0].commit.statusCheckRollup.contexts.nodes[0].conclusion = "FAILURE";
    assert.equal(fromGraphql(n, MODEL).envelope, "fail");
    n.commits.nodes[0].commit.statusCheckRollup.contexts.nodes = [];
    assert.equal(fromGraphql(n, MODEL).envelope, "unknown");
    assert.equal(fromGraphql(node, { ...MODEL, checks: { envelope: "another check" } }).envelope, "unknown");
  });
  it("a missing CI rollup is pending, not green, and a missing list of reviews or threads is unread, not zero", () => {
    const n = structuredClone(node);
    n.commits.nodes[0].commit.statusCheckRollup = null;
    assert.equal(fromGraphql(n, MODEL).ci, "PENDING");
    delete n.reviewThreads;
    delete n.latestReviews;
    const p = fromGraphql(n, MODEL);
    assert.deepEqual([p.unresolved, p.approvedAtHead], [undefined, undefined]);
  });
});

describe("release-management/T44 a list GitHub cut at one page is never taken as complete", () => {
  const HEAD = "d".repeat(40);
  const cut = (over) => ({
    number: 5, title: "T-5 x", headRefName: "w/x", headRefOid: HEAD, baseRefName: "int/x", mergeStateStatus: "CLEAN", autoMergeRequest: { enabledAt: "t" },
    files: { pageInfo: { hasNextPage: false }, nodes: [{ path: "rec/26/11/10/01/change.md" }] },
    reviewThreads: { pageInfo: { hasNextPage: false }, nodes: [] },
    latestReviews: { pageInfo: { hasNextPage: false }, nodes: [{ state: "APPROVED", commit: { oid: HEAD } }] },
    commits: { nodes: [{ commit: { oid: HEAD, statusCheckRollup: { state: "SUCCESS", contexts: { nodes: [{ name: "lint Pull Request", conclusion: "SUCCESS" }] } } } }] },
    ...over,
  });
  const MODEL2 = { ...MODEL, record: "^(rec/\\d{2}/\\d{2}/\\d{2}/\\d{2})/" };
  const run = (node) => trackWork({ prs: [fromGraphql(node, MODEL2)] }, { model: MODEL2 });
  it("a complete read is classified with confidence", () => {
    const [w] = run(cut()).work;
    assert.deepEqual([w.waitingFor, w.record, w.unread], ["merge", "rec/26/11/10/01", []]);
  });
  it("review threads cut with none open on the page: the unresolved count is unknown, so the piece is unknown, never merge or approval", () => {
    const [w] = run(cut({ reviewThreads: { pageInfo: { hasNextPage: true }, nodes: [{ isResolved: true }] } })).work;
    assert.deepEqual([w.waitingFor, w.missing], ["unknown", ["unresolved"]]);
  });
  it("review threads cut with one open on the page: that is a fact, the piece waits for a fix", () => {
    const [w] = run(cut({ reviewThreads: { pageInfo: { hasNextPage: true }, nodes: [{ isResolved: false }] } })).work;
    assert.equal(w.waitingFor, "fix");
  });
  it("reviews cut with no approval of the head on the page: the approval is unknown", () => {
    const [w] = run(cut({ latestReviews: { pageInfo: { hasNextPage: true }, nodes: [{ state: "COMMENTED", commit: { oid: HEAD } }] } })).work;
    assert.deepEqual([w.waitingFor, w.missing], ["unknown", ["approval"]]);
  });
  it("reviews cut with the head approved on the page: approved is a fact", () => {
    const [w] = run(cut({ latestReviews: { pageInfo: { hasNextPage: true }, nodes: [{ state: "APPROVED", commit: { oid: HEAD } }] } })).work;
    assert.equal(w.waitingFor, "merge");
  });
  it("changed files cut with no record folder on the page: the record is unread and the report says so, it is not reported as none", () => {
    const r = run(cut({ files: { pageInfo: { hasNextPage: true }, nodes: [{ path: "docs/x.md" }] } }));
    assert.deepEqual([r.work[0].record, r.work[0].unread], [null, ["record"]]);
    assert.match(render(r), /incomplete: #5 record not fully read/);
  });
  it("changed files cut with the record folder on the page: the record is known", () => {
    const [w] = run(cut({ files: { pageInfo: { hasNextPage: true }, nodes: [{ path: "rec/26/11/10/01/a.md" }] } })).work;
    assert.deepEqual([w.record, w.unread], ["rec/26/11/10/01", []]);
  });
});

describe("release-management/T44 gathering reads page by page and never as one heavy call", () => {
  it("follows the cursor through every page of pull requests and of branches", async () => {
    const seen = [];
    const paged = async (a) => {
      if (a[0] !== "graphql") return fake()(a);
      const q = a.find((x) => x.startsWith("query="));
      const after = a.includes("-F") ? a.find((x) => x.startsWith("after="))?.slice(6) : undefined;
      seen.push([q.includes("pullRequests(") ? "pr" : "ref", after ?? null]);
      if (!q.includes("pullRequests(")) return fake()(a);
      const second = after === "c1";
      return { data: { repository: { pullRequests: { pageInfo: { hasNextPage: !second, endCursor: second ? null : "c1" }, nodes: [node(second ? 2 : 1, "int/x")] } } } };
    };
    const f = await gather(paged, "O/R", MODEL);
    assert.deepEqual(f.prs.map((p) => p.number), [1, 2]);
    assert.deepEqual(seen.filter(([k]) => k === "pr").map(([, c]) => c), [null, "c1"]);
    assert.ok(!f.gaps.some((g) => /more open pull requests/.test(g)));
  });
  it("a page without a cursor, or more pages than the limit, is a gap, not a complete list", async () => {
    const f = await gather(fake(true), "O/R", MODEL);
    assert.ok(f.gaps.some((g) => /more open pull requests than were read/.test(g)));
  });
  it("one page asks for few pull requests, so the call stays light", async () => {
    let query = "";
    await gather(async (a) => { if (a[0] === "graphql" && a.find((x) => x.startsWith("query=")).includes("pullRequests(")) query = a.find((x) => x.startsWith("query=")); return fake()(a); }, "O/R", MODEL);
    assert.match(query, /pullRequests\(states:OPEN,first:20/);
  });
});
