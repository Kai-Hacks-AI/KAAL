// hosting/T328 draft (hosting/C113, amendment): the opened base is the revision whose policy was read.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { BASE, HEAD, options, posts, request, world } from "./fixtures.mjs";

const raise = (w) => hosting.raisePullRequest(request, options(w)).then(() => null, (e) => e);

it("hosting/T328: a pull request that opened against another base than the one whose policy was read gets no auto-merge", async () => {
  const opened = (base) => world({ script: (r) => (r.method === "POST" && r.path.endsWith("/pulls") ? { status: 201, json: { number: 7, html_url: "https://github.com/o/r/pull/7", node_id: "PR_node7", head: { sha: HEAD }, base } } : undefined) });
  for (const [why, base] of [["a moved base", { sha: "9".repeat(40) }], ["no base sha", {}], ["no base", undefined]]) {
    const w = opened(base);
    const e = await raise(w);
    assert.equal(e?.code, "STEP_FAILED", why);
    assert.equal(e.failed, "revision", why);
    assert.deepEqual(e.steps, ["open"], why);
    assert.equal(e.number, 7, why);
    assert.deepEqual(posts(w.requests), ["POST /repos/o/r/pulls"], `${why}: no auto-merge, no close`);
  }
  const same = opened({ sha: BASE });
  assert.equal(await raise(same), null);
  assert.deepEqual(posts(same.requests), ["POST /repos/o/r/pulls", "POST /graphql"], "the base that was read: the declared auto-merge follows");
});
