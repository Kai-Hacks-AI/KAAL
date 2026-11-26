// hosting/T314 draft (hosting/C113): partial failures of the two steps.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { declarations, names, options, request, standIn } from "./fixtures.mjs";

it("hosting/T314: a refusal of the first step stops there; a refusal of the second reports the first as done and undoes nothing", async () => {
  const first = standIn((r) => (r.path.endsWith("/pulls") ? { status: 422, json: { message: "Validation Failed" } } : undefined));
  const e1 = await hosting.raisePullRequest(request, declarations, options({ fetch: first.fetch, api: first.api })).then(() => null, (e) => e);
  assert.equal(e1?.code, "STEP_FAILED");
  assert.deepEqual(e1.steps, []);
  assert.equal(e1.failed, "open");
  assert.deepEqual(names(first.requests), ["POST /repos/o/r/pulls"], "no retry and no second step");

  for (const [why, script] of [
    ["an HTTP refusal", (r) => (r.path.endsWith("/graphql") ? { status: 403, json: { message: "forbidden" } } : undefined)],
    ["a GraphQL error in a 200", (r) => (r.path.endsWith("/graphql") ? { status: 200, json: { errors: [{ message: "Pull request is in clean status" }] } } : undefined)],
    ["a network error", (r) => { if (r.path.endsWith("/graphql")) throw new Error("socket hang up"); }],
  ]) {
    const api = standIn(script);
    const error = await hosting.raisePullRequest(request, declarations, options({ fetch: api.fetch, api: api.api })).then(() => null, (e) => e);
    assert.equal(error?.code, "STEP_FAILED", why);
    assert.deepEqual(error.steps, ["open"], why);
    assert.equal(error.failed, "auto-merge", why);
    assert.deepEqual({ number: error.number, url: error.url }, { number: 7, url: "https://github.com/o/r/pull/7" }, `${why}: the pull request that exists is named`);
    assert.deepEqual(names(api.requests), ["POST /repos/o/r/pulls", "POST /graphql"], `${why}: no retry, no merge, no close, no delete`);
    assert.doesNotMatch(error.message, /ghp_SECRET/);
  }
});
