// hosting/T310 draft (hosting/C113): a two-step raise, exact requests.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DO, SYNC, chapters, declarations, names, options, request, standIn } from "./fixtures.mjs";

it("hosting/T310: raisePullRequest opens the pull request with the rendered body, then enables the declared auto-merge, in that order", async () => {
  const api = standIn();
  const result = await hosting.raisePullRequest(request, declarations, options({ fetch: api.fetch, api: api.api }));
  assert.deepEqual(names(api.requests), ["POST /repos/o/r/pulls", "POST /graphql"]);
  const [open, merge] = api.requests;
  assert.deepEqual(open.body, { title: request.title, head: "claude/work", base: "kaal/hosting/gen", body: hosting.renderBody(DO, chapters), draft: false });
  assert.equal(open.headers.authorization, "Bearer ghp_SECRET_TOKEN_VALUE");
  assert.match(merge.body.query, /enablePullRequestAutoMerge/);
  assert.deepEqual(merge.body.variables, { pullRequestId: "PR_node7", mergeMethod: "SQUASH" });
  assert.deepEqual(result, { number: 7, url: "https://github.com/o/r/pull/7", steps: ["open", "auto-merge"] });

  const sync = standIn();
  await hosting.raisePullRequest({ ...request, type: "SYNC", chapters: { Change: "x", Reason: "y" }, head: "sync/a", base: "kaal/hosting/gen", title: "Sync" }, declarations, options({ fetch: sync.fetch, api: sync.api }));
  assert.equal(sync.requests[1].body.variables.mergeMethod, "MERGE", "the owner's declared method, not the default");
  assert.equal(SYNC.raise.autoMerge, "merge");
});
