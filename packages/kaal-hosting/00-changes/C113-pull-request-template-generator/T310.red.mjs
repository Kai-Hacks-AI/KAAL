// hosting/T310 draft (hosting/C113): a revision-bound, two-step raise with exact requests.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { BASE, DO, HEAD, PATHS, chapters, options, policy, posts, reads, request, world, SYNC, CHANGED } from "./fixtures.mjs";

it("hosting/T310: raisePullRequest reads the revision and the owners' policy from the base, then opens the pull request, then enables the declared auto-merge", async () => {
  const w = world();
  const result = await hosting.raisePullRequest(request, options(w));
  assert.deepEqual(posts(w.requests), ["POST /repos/o/r/pulls", "POST /graphql"]);
  const firstPost = w.requests.findIndex((r) => r.method === "POST");
  assert.ok(w.requests.slice(0, firstPost).every((r) => r.method === "GET"), "every read precedes the first write");
  const read = reads(w.requests);
  for (const expected of ["/repos/o/r/commits/claude/work", "/repos/o/r/commits/kaal/hosting/gen", `/repos/o/r/compare/${BASE}...${HEAD}`,
    `/repos/o/r/contents/${PATHS.typeList}@${BASE}`, `/repos/o/r/contents/${PATHS.declaration("kaal-change")}@${BASE}`, `/repos/o/r/contents/${PATHS.writeAreas}@${BASE}`]) assert.ok(read.includes(expected), expected);
  const [open, merge] = w.requests.filter((r) => r.method === "POST");
  assert.deepEqual(open.body, { title: request.title, head: "claude/work", base: "kaal/hosting/gen", body: hosting.renderBody(DO, chapters), draft: false });
  assert.equal(open.headers.authorization, "Bearer ghp_SECRET_TOKEN_VALUE");
  assert.match(merge.body.query, /enablePullRequestAutoMerge/);
  assert.deepEqual(merge.body.variables, { pullRequestId: "PR_node7", mergeMethod: "SQUASH" });
  assert.deepEqual(result, { number: 7, url: "https://github.com/o/r/pull/7", steps: ["open", "auto-merge"] });
  assert.equal(SYNC.raise.autoMerge, "merge");
  assert.ok(CHANGED.length === 1 && policy()[PATHS.typeList]);
});
