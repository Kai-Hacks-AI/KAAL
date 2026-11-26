// hosting/T325 draft (hosting/C114): a grant cannot be forged, substituted or widened; a call with a grant it does not hold is refused.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { granted } from "./fixtures.mjs";

it("hosting/T325: only a grant minted by Hosting is accepted, with the abilities GitHub really granted, until it expires", async () => {
  const { grant, api } = await granted(["read-contents"], () => ({ status: 200, json: { object: { sha: "c".repeat(40) } } }));
  const use = (g, extra = {}) => hosting.readRef("o/r", "main", { grant: g, fetch: api.fetch, api: api.api, ...extra });
  assert.equal(await use(grant), "c".repeat(40));
  const sent = api.requests.length;
  for (const [why, forged] of [
    ["a plain object naming a token and abilities", { token: "ghs_X", abilities: ["read-contents"] }],
    ["a copy of the grant", { ...grant }],
    ["a copy of the grant with a widened ability list", { ...grant, abilities: ["read-contents", "approve-pull-requests"] }],
    ["a clone of the grant", structuredClone(grant)],
    ["the grant with another prototype", Object.assign(Object.create(null), grant)],
    ["a bare token", "ghs_X"],
    ["nothing", undefined],
  ]) {
    await assert.rejects(use(forged), (e) => e.code === "GRANT_UNTRUSTED", why);
  }
  assert.throws(() => { grant.abilities = ["approve-pull-requests"]; }, TypeError, "a grant cannot be edited");
  assert.deepEqual(hosting.grantAbilities(grant), ["read-contents"]);
  assert.throws(() => hosting.grantAbilities({ abilities: ["read-contents"] }), (e) => e.code === "GRANT_UNTRUSTED");
  assert.equal(api.requests.length, sent, "refused before any call");
  // opts.abilities, opts.token and opts.declaration are not options.
  await assert.rejects(use(grant, { abilities: ["read-contents", "approve-pull-requests"] }), (e) => e.code === "INVALID_READ");
  await assert.rejects(use(grant, { token: "ghs_X" }), (e) => e.code === "INVALID_READ");
  await assert.rejects(use(grant, { declaration: {} }), (e) => e.code === "INVALID_READ");
  // An expired grant is refused by the clock Hosting is given, before any call.
  await assert.rejects(use(grant, { now: () => Date.parse(grant.expiresAt) + 1 }), (e) => e.code === "GRANT_EXPIRED");
  assert.equal(api.requests.length, sent);
});
