// hosting/T331 draft (hosting/C114): approval identity is enforced by the Approver's own grant, before adoption.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { mint, standIn } from "./fixtures.mjs";

const HEAD = "a".repeat(40);
const review = (login, type, state, commit = HEAD) => ({ state, commit_id: commit, user: { login, type }, body: "ignored" });

it("hosting/T331: only an APPROVED review on the head by the bot of the Approver's own grant counts; listReviews gives facts only", async () => {
  const world = { appId: "67890", slug: "kaal-approver", declarations: [{ path: "packages/kaal-review/13-source/github-apps/approver.json", declaration: { app: "approver", name: "KAAL Approver", owner: "kaal-review", purpose: "p", appId: "67890", abilities: ["read-contents", "read-pull-requests", "approve-pull-requests"] } }] };
  const { grant } = await mint(["read-contents", "read-pull-requests"], world, { app: "approver", appId: "67890" });
  const identity = hosting.grantIdentity(grant);
  assert.deepEqual(identity, { appId: "67890", login: "kaal-approver[bot]" });
  const api = standIn(() => ({ status: 200, json: [review("kaal-approver[bot]", "Bot", "APPROVED"), review("kaal-dispatcher[bot]", "Bot", "APPROVED"), review("kaal-approver[bot]", "Bot", "COMMENTED"), review("kaal-approver", "User", "APPROVED"), review("kaal-approver[bot]", "Bot", "APPROVED", "b".repeat(40)), review("kaal-approver[bot]", "Bot", "DISMISSED")] }));
  const reviews = await hosting.listReviews("o/r", 7, { grant, fetch: api.fetch, api: api.api });
  assert.deepEqual(reviews[0], { state: "APPROVED", commit: HEAD, by: { login: "kaal-approver[bot]", type: "Bot" } });
  assert.deepEqual(Object.keys(reviews[0]).sort(), ["by", "commit", "state"]);
  assert.equal(hosting.countApprovals(reviews, identity, HEAD), 1, "only the Approver's own bot on the head counts");
  assert.equal(hosting.countApprovals(reviews, { appId: "12345", login: "kaal-dispatcher[bot]" }, HEAD), 1, "the identity decides: another App counts only for itself");
  assert.equal(hosting.countApprovals(reviews, identity, "c".repeat(40)), 0, "an older head counts for nothing");
  assert.equal(hosting.countApprovals([], identity, HEAD), 0);
  assert.ok(api.requests.every((r) => r.method === "GET"));
});
