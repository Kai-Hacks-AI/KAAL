// release-management/T44 (C7): what cannot be read is shown as a gap, and the facts are gathered without writing anything.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { gather } from "./gather.mjs";
import { ciOf, render, trackWork } from "./track-work.mjs";

const SHA = "c".repeat(40);
const node = (number, base) => ({
  number, title: `release-management/C7 DO: x${number}`, headRefName: `h${number}`, headRefOid: SHA, baseRefName: base, mergeStateStatus: "CLEAN", autoMergeRequest: null,
  reviewThreads: { pageInfo: { hasNextPage: false }, nodes: [] }, latestReviews: { nodes: [] },
  commits: { nodes: [{ commit: { oid: SHA, statusCheckRollup: { state: "SUCCESS", contexts: { nodes: [] } } } }] },
});
const fake = (more = false) => async (a) => {
  if (a[0] === "graphql") {
    return { data: { repository: {
      pullRequests: { pageInfo: { hasNextPage: more }, nodes: [node(1, "kaal/x")] },
      refs: { pageInfo: { hasNextPage: false }, nodes: [
        { name: "main", target: { oid: SHA }, associatedPullRequests: { totalCount: 0 } },
        { name: "kaal/x", target: { oid: SHA }, associatedPullRequests: { totalCount: 5 } },
        { name: "claude/lonely", target: { oid: SHA }, associatedPullRequests: { totalCount: 0 } },
        { name: "claude/done", target: { oid: SHA }, associatedPullRequests: { totalCount: 1 } },
      ] },
    } } };
  }
  assert.ok(!a.includes("-X") && !a.includes("--method"), "gathering writes nothing");
  if (a[0].includes("/compare/main...kaal/x")) return { ahead_by: 2 };
  if (a[0].endsWith("/commits/main")) return { sha: SHA };
  if (a[0].includes("/releases")) return [];
  throw new Error(`unexpected read ${a[0]}`);
};

describe("release-management/T44 gathering is read-only and shows what it could not read", () => {
  it("maps pull requests, a branch with no pull request and a collector ahead of main", async () => {
    const f = await gather(fake(), "O/R");
    assert.deepEqual([f.prs.length, f.branches.map((b) => b.name), f.collectors.map((c) => [c.name, c.aheadOfMain])], [1, ["claude/lonely"], [["kaal/x", 2]]]);
  });
  it("lists the unread: the npm deployment request, no Release, and a page limit", async () => {
    const f = await gather(fake(true), "O/R");
    assert.ok(f.gaps.some((g) => /deployment request/.test(g)));
    assert.ok(f.gaps.some((g) => /no Release/.test(g)));
    assert.ok(f.gaps.some((g) => /more than 100 open pull requests/.test(g)));
  });
  it("the report prints the gaps after the lines, never an empty report that looks complete", async () => {
    const out = render(trackWork(await gather(fake(), "O/R"), { role: "cto" }), { role: "cto" });
    assert.match(out, /claude\/lonely/);
    assert.match(out, /incomplete: 10-npmjs/);
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
