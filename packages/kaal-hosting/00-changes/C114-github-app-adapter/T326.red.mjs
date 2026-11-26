// hosting/T326 draft (hosting/C114): the raise path of hosting/C113 takes the same grant; a bare token and a grant that cannot raise are refused.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { mint, standIn } from "./fixtures.mjs";

it("hosting/T326: raisePullRequest accepts only a grant holding raise-pull-requests and read-contents, never a bare token", async () => {
  const api = standIn(() => ({ status: 500, json: {} }));
  const request = { repo: "o/r", type: "PLAN", head: "claude/w", base: "kaal/c/b", title: "t", chapters: { Change: "x", From: "x", To: "x", Because: "x" } };
  const opts = (grant) => ({ grant, fetch: api.fetch, api: api.api });
  const readOnly = (await mint(["read-contents"])).grant;
  const { grant: raising } = await mint(["read-contents", "raise-pull-requests"]);
  for (const [why, g, code] of [
    ["a bare token", undefined, "GRANT_UNTRUSTED"],
    ["a forged grant", { token: "ghs_X", abilities: ["raise-pull-requests", "read-contents"] }, "GRANT_UNTRUSTED"],
    ["a grant that cannot raise", readOnly, "ABILITY_REFUSED"],
  ]) {
    await assert.rejects(hosting.raisePullRequest(request, opts(g)), (e) => e.code === code, why);
  }
  await assert.rejects(hosting.raisePullRequest(request, { token: "ghs_X", fetch: api.fetch, api: api.api }), (e) => e.code === "RAISE_REFUSED" && e.rule === "token", "the token option is gone");
  assert.equal(api.requests.length, 0, "refused before any call");
  // The grant that can raise reaches the first read (and the stand-in then fails it, which is named).
  await assert.rejects(hosting.raisePullRequest(request, opts(raising)), (e) => e.code === "STEP_FAILED" || e.code === "RAISE_REFUSED");
  assert.ok(api.requests.length > 0, "a grant that can raise goes on");
});
