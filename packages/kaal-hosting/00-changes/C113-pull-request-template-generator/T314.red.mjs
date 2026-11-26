// hosting/T314 draft (hosting/C113): partial failures of the steps, and a revision that moves.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { HEAD, options, posts, request, world } from "./fixtures.mjs";

const raise = (w) => hosting.raisePullRequest(request, options(w)).then(() => null, (e) => e);

it("hosting/T314: a refused first step ends there; a refused second step names the pull request that exists and undoes nothing; a moved head enables nothing", async () => {
  const first = world({ script: (r) => (r.method === "POST" && r.path.endsWith("/pulls") ? { status: 422, json: { message: "Validation Failed" } } : undefined) });
  const e1 = await raise(first);
  assert.equal(e1?.code, "STEP_FAILED");
  assert.deepEqual(e1.steps, []);
  assert.equal(e1.failed, "open");
  assert.deepEqual(posts(first.requests), ["POST /repos/o/r/pulls"], "no retry and no second step");

  for (const [why, script] of [
    ["an HTTP refusal", (r) => (r.path.endsWith("/graphql") ? { status: 403, json: { message: "forbidden" } } : undefined)],
    ["a GraphQL error in a 200", (r) => (r.path.endsWith("/graphql") ? { status: 200, json: { errors: [{ message: "Pull request is in clean status" }] } } : undefined)],
    ["a network error", (r) => { if (r.path.endsWith("/graphql")) throw new Error("socket hang up"); }],
  ]) {
    const w = world({ script });
    const e = await raise(w);
    assert.equal(e?.code, "STEP_FAILED", why);
    assert.deepEqual(e.steps, ["open"], why);
    assert.equal(e.failed, "auto-merge", why);
    assert.deepEqual({ number: e.number, url: e.url }, { number: 7, url: "https://github.com/o/r/pull/7" }, `${why}: the pull request that exists is named`);
    assert.deepEqual(posts(w.requests), ["POST /repos/o/r/pulls", "POST /graphql"], `${why}: no retry, no merge, no close, no delete`);
    assert.doesNotMatch(e.message, /ghp_SECRET/);
  }

  const moved = world({ script: (r) => (r.method === "POST" && r.path.endsWith("/pulls") ? { status: 201, json: { number: 7, html_url: "https://github.com/o/r/pull/7", node_id: "PR_node7", head: { sha: "9".repeat(40) } } } : undefined) });
  const e3 = await raise(moved);
  assert.equal(e3?.code, "STEP_FAILED");
  assert.equal(e3.failed, "revision");
  assert.deepEqual(e3.steps, ["open"]);
  assert.equal(e3.number, 7);
  assert.deepEqual(posts(moved.requests), ["POST /repos/o/r/pulls"], "the head the pull request opened with is not the head that was checked: no auto-merge, no close");
  assert.notEqual("9".repeat(40), HEAD);
});
