// Approving a pull request as an App at a named commit (hosting/C174, T356 to T359). They use the App fixtures of hosting/C114
// (`app-fixtures.mjs`). Nothing reaches GitHub. The Cases are the drafts of the Change's PLAN (`00-changes/C174-post-review`),
// delivered unchanged.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DISPATCHER, granted } from "./app-fixtures.mjs";

const HEAD = "2".repeat(40);
const APPROVER = { ...DISPATCHER, app: "approver", name: "KAAL Approver", owner: "kaal-review", appId: "5953433", abilities: ["read-contents", "read-pull-requests", "approve-pull-requests"] };
const WORLD = {
  declarations: [{ path: "packages/kaal-review/13-source/github-apps/approver.json", declaration: APPROVER }],
  appId: "5953433", slug: "kaal-approver", installPermissions: { metadata: "read", contents: "read", pull_requests: "write" },
};
const ID = { app: "approver", appId: "5953433" };
const ABILITIES = ["read-contents", "approve-pull-requests"];
const review = { revision: HEAD, event: "APPROVE", body: "verify Sync passes at this head" };
const made = (body, extra = {}) => ({ id: 9001, state: "APPROVED", commit_id: body.commit_id, body: body.body, user: { login: "kaal-approver[bot]", type: "Bot", id: 777 }, ...extra });
const route = (extra) => (r) => (r.method === "POST" && r.path === "/repos/o/r/pulls/7/reviews" ? { status: 200, json: made(r.body, typeof extra === "function" ? extra(r) : extra) } : { status: 404, json: { message: "Not Found" } });
const post = async (rv, { abilities = ABILITIES, world = route(), repo = "o/r", number = 7, extra = {} } = {}) => {
  const { grant, api } = await granted(abilities, world, WORLD, ID);
  const mark = api.mark();
  return { grant, api, mark, opts: { grant, fetch: api.fetch, api: api.api, ...extra }, run: () => hosting.postReview(repo, number, rv, { grant, fetch: api.fetch, api: api.api, ...extra }) };
};

it("hosting/T356: postReview sends one POST of the fixed form at the named commit with the grant's token and returns the approval as a fact Hosting made", async () => {
  const p = await post(review);
  const fact = await p.run();
  assert.deepEqual(fact, { id: 9001, number: 7, revision: HEAD, state: "APPROVED", reviewer: { login: "kaal-approver[bot]", type: "Bot" } });
  assert.equal(Object.isFrozen(fact), true);
  assert.deepEqual(hosting.factOrigin(fact), { app: "approver", repo: "o/r" });
  assert.equal(hosting.factOrigin({ ...fact }), null, "a copy is not Hosting's fact");
  const sent = p.api.requests.slice(p.mark);
  assert.equal(sent.length, 1, "one request: no read before it, none after, no retry");
  assert.equal(sent[0].method, "POST");
  assert.equal(sent[0].path, "/repos/o/r/pulls/7/reviews");
  assert.match(sent[0].headers.authorization, /^Bearer ghs_GRANT/);
  assert.deepEqual(sent[0].body, { commit_id: HEAD, event: "APPROVE", body: "verify Sync passes at this head" }, "the commit is named: an approval never lands on a later push");
  const bare = await post({ revision: HEAD, event: "APPROVE" });
  await bare.run();
  assert.deepEqual(bare.api.requests.at(-1).body, { commit_id: HEAD, event: "APPROVE" }, "no body asked, none sent");
});

it("hosting/T357: postReview needs the ability approve-pull-requests and its own grant, takes no authority from the caller, and refuses before any call", async () => {
  const p = await post(review);
  const refused = async (why, rv, o, code, repo = "o/r", number = 7) => {
    await assert.rejects(hosting.postReview(repo, number, rv, o), (e) => e.code === code, why);
  };
  await refused("no grant", review, { fetch: p.api.fetch, api: p.api.api }, "GRANT_UNTRUSTED");
  await refused("a forged grant", review, { ...p.opts, grant: { token: "ghs_X", abilities: ["approve-pull-requests"] } }, "GRANT_UNTRUSTED");
  await refused("another repository", review, p.opts, "GRANT_REPO_MISMATCH", "o/other");
  for (const key of ["state", "app", "appId", "id", "commit_id", "user", "token", "permissions", "abilities", "comments"]) {
    for (const value of [undefined, null, false, 0, "", "x"]) await refused(`${key}: ${String(value)} in the review`, { ...review, [key]: value }, p.opts, "INVALID_REVIEW");
  }
  await refused("a symbol key of the review", { ...review, [Symbol("extra")]: undefined }, p.opts, "INVALID_REVIEW");
  for (const key of ["token", "abilities", "review", "declaration", "extra"]) await refused(`${key} as an option`, review, { ...p.opts, [key]: undefined }, "INVALID_REVIEW");
  await refused("a symbol key of the options", review, { ...p.opts, [Symbol("extra")]: undefined }, "INVALID_REVIEW");
  assert.equal(p.api.requests.length, p.mark, "every refusal came before any call");
  for (const [why, abilities] of [["read-only", ["read-contents", "read-pull-requests"]], ["contents only", ["read-contents"]]]) {
    const w = await post(review, { abilities });
    await assert.rejects(w.run(), (e) => e.code === "ABILITY_REFUSED", why);
    assert.equal(w.api.requests.length, w.mark, `a grant that is ${why} sends nothing`);
  }
});

it("hosting/T358: postReview refuses a pull request number, a commit, an event or a note GitHub would not take or that does not say what it must, before any call", async () => {
  const p = await post(review);
  const refused = async (why, rv, ...number) => {
    await assert.rejects(hosting.postReview("o/r", number.length ? number[0] : 7, rv, p.opts), (e) => e.code === "INVALID_REVIEW", why);
  };
  for (const n of [0, -1, 1.5, "7", NaN, Infinity, null, undefined]) await refused(`number ${String(n)}`, review, n);
  for (const r of ["", "abc", "A".repeat(40), "g".repeat(40), "2".repeat(39), "2".repeat(41), "2".repeat(64), 7, null, undefined]) await refused(`revision ${String(r)}`, { ...review, revision: r });
  for (const e of ["COMMENT", "REQUEST_CHANGES", "approve", "APPROVED", "", 1, null, undefined]) await refused(`event ${String(e)}`, { ...review, event: e });
  for (const b of ["", "   ", 5, null, "x".repeat(65536)]) await refused(`body ${String(b).slice(0, 8)}`, { ...review, body: b });
  for (const rv of [null, undefined, "APPROVE", [], 5]) await refused(`review ${String(rv)}`, rv);
  assert.equal(p.api.requests.length, p.mark, "every refusal came before any call");
  const edge = await post({ ...review, body: "x".repeat(65535) });
  assert.equal((await edge.run()).state, "APPROVED", "the longest note is posted");
  const undef = await post({ revision: HEAD, event: "APPROVE", body: undefined });
  await undef.run();
  assert.deepEqual(undef.api.requests.at(-1).body, { commit_id: HEAD, event: "APPROVE" }, "a body of undefined is none");
});

it("hosting/T359: postReview fails by name and never retries: a refused or failed post keeps GitHub's status and headers, and an approval that is not the one asked for is not reported as posted", async () => {
  const fail = async (status, headers = {}) => {
    const p = await post(review, { world: () => ({ status, json: { message: "no" }, headers }) });
    await assert.rejects(p.run(), (e) => {
      assert.equal(e.code, "REVIEW_FAILED");
      assert.equal(e.status, status, "GitHub's status is kept, so a caller can tell a refusal from a failure");
      for (const [name, value] of Object.entries(headers)) assert.equal(e.headers[name.toLowerCase()], value, name);
      assert.doesNotMatch(e.message + JSON.stringify(e.headers ?? {}), /ghs_/);
      return true;
    });
    assert.equal(p.api.requests.length - p.mark, 1, `HTTP ${status}: one request, never repeated`);
  };
  await fail(403, { "Retry-After": "30", "x-ratelimit-remaining": "0" });
  await fail(422);
  await fail(429);
  await fail(500);
  const net = await post(review, { world: () => { throw new Error("socket closed ghs_GRANT"); } });
  await assert.rejects(net.run(), (e) => e.code === "REVIEW_FAILED" && e.status === undefined && !/ghs_/.test(e.message + JSON.stringify(e.headers ?? {})));
  assert.equal(net.api.requests.length - net.mark, 1);
  // What GitHub made must be the approval asked for, of that commit, by the App whose grant posted it.
  for (const [why, extra] of [
    ["another commit", { commit_id: "9".repeat(40) }], ["no commit", { commit_id: undefined }], ["a comment, not an approval", { state: "COMMENTED" }], ["pending", { state: "PENDING" }],
    ["changes requested", { state: "CHANGES_REQUESTED" }], ["dismissed", { state: "DISMISSED" }], ["another reviewer", { user: { login: "kaal-inspector[bot]", type: "Bot", id: 1 } }],
    ["a person", { user: { login: "kaal-approver[bot]", type: "User", id: 777 } }], ["no reviewer", { user: undefined }], ["no id", { id: undefined }], ["a text id", { id: "9001" }],
  ]) {
    const p = await post(review, { world: route(extra) });
    await assert.rejects(p.run(), (e) => e.code === "REVIEW_MISMATCH", why);
    assert.equal(p.api.requests.length - p.mark, 1, `${why}: one request, never repeated`);
  }
  const wrongStatus = await post(review, { world: (r) => ({ status: 201, json: made(r.body) }) });
  await assert.rejects(wrongStatus.run(), (e) => e.code === "REVIEW_FAILED" && e.status === 201, "an answer that is not GitHub's 200 is not an approval");
});
