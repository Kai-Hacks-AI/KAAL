// hosting/T329 draft (hosting/C114): a GitHub App id is bound to its declaration by the Owner's record, not by the caller's name.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DISPATCHER, appWorld, keys } from "./fixtures.mjs";

const { privateKey, verify } = keys();
const APPROVER = { app: "approver", name: "KAAL Approver", owner: "kaal-review", purpose: "Approves clean SYNCs.", appId: "67890", abilities: DISPATCHER.abilities.filter((a) => a !== "raise-pull-requests").concat(["approve-pull-requests"]) };
const twin = { ...APPROVER, abilities: [...DISPATCHER.abilities.filter((a) => a !== "raise-pull-requests"), "approve-pull-requests"] };
const both = [{ path: "packages/kaal-release/13-source/github-apps/dispatcher.json", declaration: DISPATCHER }, { path: "packages/kaal-review/13-source/github-apps/approver.json", declaration: APPROVER }];
const run = async (input, world) => {
  const api = appWorld({ verify, declarations: both, ...world });
  const out = await hosting.mintToken({ appId: "12345", privateKey, repo: "o/r", abilities: ["read-contents"], app: "dispatcher", ...input }, { fetch: api.fetch, api: api.api, now: () => 1_800_000_000_000 }).then((g) => ({ g }), (e) => ({ e }));
  return { ...out, api };
};

it("hosting/T329: swapped credentials, names and installations refuse; an identical ability set does not blur two Apps", async () => {
  // Honest: the Dispatcher's id and key under the Dispatcher's name mint.
  assert.ok((await run({})).g);
  for (const [why, input, world] of [
    ["the Approver's id and key under the Dispatcher's name", { appId: "67890" }, { appId: "67890", slug: "kaal-approver" }],
    ["the Dispatcher's id and key under the Approver's name", { app: "approver" }, {}],
    ["a caller id that is not the id GitHub reports for the key", { appId: "12345" }, { appId: "67890" }],
    ["an installation of another App", {}, { installAppId: 67890 }],
    ["a declaration without appId", {}, { declarations: [{ path: both[0].path, declaration: { ...DISPATCHER, appId: undefined } }] }],
    ["two declarations with one appId", {}, { declarations: [...both, { path: "packages/kaal-review/13-source/github-apps/inspector.json", declaration: { ...twin, app: "inspector", appId: "12345" } }] }],
  ]) {
    const { e, api } = await run(input, world);
    assert.match(String(e?.code), /^(APP_IDENTITY_MISMATCH|INVALID_APP_DECLARATION)$/, why);
    assert.equal(api.requests.filter((r) => r.method === "POST").length <= 1, true, `${why}: the narrowed token was never requested`);
    assert.doesNotMatch(JSON.stringify({ m: e.message, s: e.stack }), /PRIVATE KEY|ghs_/, why);
  }
  // Identical abilities: the Approver declaration, minted with the Approver's own id, works, and the Dispatcher's id does not.
  const mine = await run({ app: "approver", appId: "67890", abilities: ["read-contents", "approve-pull-requests"] }, { appId: "67890", slug: "kaal-approver" });
  assert.ok(mine.g);
  assert.deepEqual(hosting.grantIdentity(mine.g), { appId: "67890", login: "kaal-approver[bot]" });
});
