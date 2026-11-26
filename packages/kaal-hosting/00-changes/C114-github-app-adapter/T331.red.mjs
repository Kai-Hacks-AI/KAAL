// hosting/T331 draft (hosting/C114): approval identity is enforced by the Approver's own grant, before adoption.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { granted } from "./fixtures.mjs";

const HEAD = "a".repeat(40);
const review = (login, type, state, commit = HEAD) => ({ state, commit_id: commit, user: { login, type }, body: "ignored" });

it("hosting/T331: listReviews gives authenticated facts and the grant's verified identity; Hosting judges no approval", async () => {
  const world = { appId: "67890", slug: "kaal-approver", declarations: [{ path: "packages/kaal-review/13-source/github-apps/approver.json", declaration: { app: "approver", name: "KAAL Approver", owner: "kaal-review", purpose: "p", appId: "67890", abilities: ["read-contents", "read-pull-requests", "approve-pull-requests"] } }] };
  const REVIEWS = [review("kaal-approver[bot]", "Bot", "APPROVED"), review("kaal-dispatcher[bot]", "Bot", "APPROVED"), review("kaal-approver[bot]", "Bot", "COMMENTED"), review("kaal-approver", "User", "APPROVED"), review("kaal-approver[bot]", "Bot", "APPROVED", "b".repeat(40)), review("kaal-approver[bot]", "Bot", "DISMISSED")];
  const { grant, api } = await granted(["read-contents", "read-pull-requests"], () => ({ status: 200, json: REVIEWS }), world, { app: "approver", appId: "67890" });
  const identity = hosting.grantIdentity(grant);
  assert.deepEqual(identity, { appId: "67890", login: "kaal-approver[bot]" });
  const reviews = await hosting.listReviews("o/r", 7, { grant, fetch: api.fetch, api: api.api });
  assert.deepEqual(reviews[0], { state: "APPROVED", commit: HEAD, by: { login: "kaal-approver[bot]", type: "Bot" } });
  assert.deepEqual(Object.keys(reviews[0]).sort(), ["by", "commit", "state"]);
  assert.equal(reviews.length, 6, "every review is a fact, none is judged");
  assert.deepEqual(reviews.map((r) => r.by.login), ["kaal-approver[bot]", "kaal-dispatcher[bot]", "kaal-approver[bot]", "kaal-approver", "kaal-approver[bot]", "kaal-approver[bot]"]);
  assert.equal(hosting.countApprovals, undefined, "approval is judged by Review, not exported by Hosting");
  assert.ok(api.requests.slice(api.mark()).every((r) => r.method === "GET"));
});
