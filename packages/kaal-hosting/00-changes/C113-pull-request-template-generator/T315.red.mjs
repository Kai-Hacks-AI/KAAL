// hosting/T315 draft (hosting/C113): the token.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { options, request, world } from "./fixtures.mjs";

it("hosting/T315: a missing token is refused before any call, and the token is sent only in the Authorization header", async () => {
  const none = world();
  await assert.rejects(hosting.raisePullRequest(request, options(none, { token: "" })), (e) => e.code === "RAISE_REFUSED" && e.rule === "token");
  assert.equal(none.requests.length, 0);
  const w = world({ script: (r) => (r.path.endsWith("/graphql") ? { status: 403, json: { message: "no" } } : undefined) });
  const out = [];
  const log = console.log; const err = console.error;
  console.log = (...a) => out.push(a.join(" ")); console.error = (...a) => out.push(a.join(" "));
  let error;
  try { await hosting.raisePullRequest(request, options(w)); } catch (e) { error = e; } finally { console.log = log; console.error = err; }
  for (const r of w.requests) {
    assert.equal(r.headers.authorization, "Bearer ghp_SECRET_TOKEN_VALUE", `${r.method} ${r.path}`);
    assert.doesNotMatch(JSON.stringify(r.body ?? {}) + r.path + JSON.stringify(r.query), /ghp_SECRET/);
  }
  assert.doesNotMatch(JSON.stringify({ message: error.message, stack: error.stack, steps: error.steps, out }), /ghp_SECRET/);
});
