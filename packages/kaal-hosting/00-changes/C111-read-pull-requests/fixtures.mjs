// Fixtures of hosting/C111: a fake `gh` (the seam options.gh) that answers like each environment. No binary, no network.
const SHA = "7".repeat(40);
const REPOSITORY = "owner/sample";
export { REPOSITORY, SHA };

const pull = { number: 7, title: "PLAN: A sample change", draft: false, state: "open", mergeable_state: "clean", auto_merge: null, head: { ref: "claude/sample-plan", sha: SHA }, base: { ref: "main" } };
const graphqlAnswer = {
  data: { repository: { pullRequests: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [{
    number: 7, title: pull.title, isDraft: false, headRefName: pull.head.ref, headRefOid: SHA, baseRefName: "main", mergeStateStatus: "CLEAN", autoMergeRequest: null,
    reviewThreads: { pageInfo: { hasNextPage: false }, nodes: [{ isResolved: false }, { isResolved: true }] },
    latestReviews: { pageInfo: { hasNextPage: false }, nodes: [] },
    commits: { nodes: [{ commit: { oid: SHA, statusCheckRollup: null } }] },
  }] } } },
};
const threadRoute = [{ resolved: false, outdated: false, path: "a.md", line: 3, comment_ids: [1] }, { resolved: true, outdated: true, path: "b.md", line: null, comment_ids: [2] }];

/** mode: "graphql" (everything answers), "cloud" (GraphQL refused, REST and the thread route answer), "no-threads" (as cloud, thread route 404), "down" (every call fails). */
export function fakeGh(mode) {
  const calls = [];
  const ok = (value) => ({ status: 0, stdout: JSON.stringify(value), stderr: "" });
  const fail = (text) => ({ status: 1, stdout: "", stderr: text });
  const gh = async (args) => {
    calls.push(args);
    const route = args[0] === "api" ? args[1] ?? "" : "";
    if (mode === "down") return fail("gh: HTTP 502 Bad Gateway");
    if (route === "graphql") return mode === "graphql" ? ok(graphqlAnswer) : fail("gh: GitHub GraphQL is not available from Claude Code sessions; use the REST API. (HTTP 403)");
    const path = route.replace(/^repos\/[^/]+\/[^/]+\//, "").split("?")[0];
    if (path === "pulls") return ok([pull]);
    if (path === "pulls/7") return ok(pull);
    if (path === "pulls/7/reviews") return ok([]);
    if (path === `commits/${SHA}/check-runs`) return ok({ total_count: 0, check_runs: [] });
    if (path === `commits/${SHA}/status`) return ok({ state: "pending", statuses: [] });
    if (path === "pulls/7/ccr/review_threads") return mode === "cloud" ? ok(threadRoute) : fail("gh: Not Found (HTTP 404)");
    return fail("gh: Not Found (HTTP 404)");
  };
  return { gh, calls };
}
