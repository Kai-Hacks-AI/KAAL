// hosting/T326 (hosting/C114): the raise path of hosting/C113 takes the same grant; a bare token and a grant that cannot raise are refused.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { NOW, granted } from "./app-fixtures.mjs";

it("hosting/T326: raisePullRequest accepts only a grant holding raise-pull-requests and read-contents, never a bare token", async () => {
  const request = { repo: "o/r", type: "PLAN", head: "claude/w", base: "kaal/c/b", title: "t", chapters: { Change: "x", From: "x", To: "x", Because: "x" } };
  // A grant is bound to the transport it was minted against, so each is used with the stand-in that minted it.
  const mintedWith = async (abilities) => {
    const { grant, api } = await granted(abilities, () => ({ status: 500, json: {} }));
    return { grant, api, mark: api.mark(), opts: (g) => ({ grant: g, fetch: api.fetch, api: api.api, now: () => NOW }) };
  };
  const raising = await mintedWith(["read-contents", "raise-pull-requests"]);
  const readOnly = await mintedWith(["read-contents"]);
  for (const [why, world, g, code] of [
    ["a bare token", raising, undefined, "GRANT_UNTRUSTED"],
    ["a forged grant", raising, { token: "ghs_X", abilities: ["raise-pull-requests", "read-contents"] }, "GRANT_UNTRUSTED"],
    ["a grant that cannot raise", readOnly, readOnly.grant, "ABILITY_REFUSED"],
  ]) {
    await assert.rejects(hosting.raisePullRequest(request, world.opts(g)), (e) => e.code === code, why);
  }
  await assert.rejects(hosting.raisePullRequest(request, { token: "ghs_X", fetch: raising.api.fetch, api: raising.api.api }), (e) => e.code === "RAISE_REFUSED" && e.rule === "token", "the token option is gone");
  assert.equal(raising.api.requests.length, raising.mark, "refused before any call");
  assert.equal(readOnly.api.requests.length, readOnly.mark, "refused before any call");
  // The grant that can raise reaches the first read (and the stand-in then fails it, which is named).
  await assert.rejects(hosting.raisePullRequest(request, raising.opts(raising.grant)), (e) => e.code === "STEP_FAILED" || e.code === "RAISE_REFUSED");
  assert.ok(raising.api.requests.length > raising.mark, "a grant that can raise goes on");
});
