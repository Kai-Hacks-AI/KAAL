import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { granted, mint, standIn } from "./app-fixtures.mjs";

// hosting/T322 (hosting/C114): the Dispatcher's reads behind Hosting, in Hosting's fact shape.

const refs = (from, to) => Array.from({ length: to - from }, (_, i) => ({ ref: `refs/heads/kaal/c/b${from + i}`, object: { sha: "a".repeat(40) } }));

it("hosting/T322: listBranches, compareRevisions, listPullRequests and readRef send the documented GET requests, page to a short page and return only facts", async () => {
  const route = (r) => {
    if (r.path === "/repos/o/r/git/matching-refs/heads/kaal/") return { status: 200, json: r.query.page === "1" ? refs(0, 100) : refs(100, 101) };
    if (r.path === "/repos/o/r/compare/main...kaal/c/b0") return { status: 200, json: { ahead_by: 3, behind_by: 1, status: "diverged", files: [{ filename: "a.md", sha: "x", additions: 1 }], commits: [{ sha: "ignored" }] } };
    if (r.path === "/repos/o/r/pulls") return { status: 200, json: [{ number: 5, title: "PLAN", state: "closed", merged_at: "2026-11-25T10:00:00Z", user: { login: "x" }, head: { ref: "claude/w", sha: "b".repeat(40), repo: {} }, base: { ref: "kaal/c/b0" }, body: "b", labels: [{ name: "ignored" }] }] };
    if (r.path === "/repos/o/r/git/ref/heads/kaal/c/b0") return { status: 200, json: { object: { sha: "c".repeat(40) } } };
    if (r.path === "/repos/o/r/git/ref/heads/kaal/c/gone") return { status: 404, json: { message: "Not Found" } };
    return { status: 500, json: {} };
  };
  const { grant, api } = await granted(["read-contents", "read-pull-requests"], route);
  const mark = api.mark();
  const calls = () => api.requests.slice(mark);
  const opts = { grant, fetch: api.fetch, api: api.api };
  const branches = await hosting.listBranches("o/r", "kaal/", opts);
  assert.equal(branches.length, 101);
  assert.equal(branches[0], "kaal/c/b0");
  assert.deepEqual(calls().map((r) => `${r.path}?page=${r.query.page}&per_page=${r.query.per_page}`), ["/repos/o/r/git/matching-refs/heads/kaal/?page=1&per_page=100", "/repos/o/r/git/matching-refs/heads/kaal/?page=2&per_page=100"]);
  assert.deepEqual(await hosting.compareRevisions("o/r", "main", "kaal/c/b0", opts), { status: "diverged", aheadBy: 3, behindBy: 1, files: ["a.md"], truncated: false });
  assert.deepEqual(await hosting.listPullRequests("o/r", { state: "closed", base: "kaal/c/b0" }, opts), [{ number: 5, title: "PLAN", state: "closed", merged: true, head: { ref: "claude/w", sha: "b".repeat(40) }, base: { ref: "kaal/c/b0" }, body: "b" }]);
  const last = calls().at(-1);
  assert.deepEqual({ state: last.query.state, base: last.query.base }, { state: "closed", base: "kaal/c/b0" });
  assert.equal(await hosting.readRef("o/r", "kaal/c/b0", opts), "c".repeat(40));
  assert.equal(await hosting.readRef("o/r", "kaal/c/gone", opts), null, "an absent ref is a fact, not a failure");
  assert.ok(calls().every((r) => r.method === "GET" && r.headers.authorization === "Bearer ghs_GRANT"), "GET only, token only in the header");

  const before = calls().length;
  for (const call of [() => hosting.listPullRequests("o/r", { state: "everything" }, opts), () => hosting.listBranches("o/r", "", opts), () => hosting.listPullRequests("o/r", { state: "open", head: "branch-without-owner" }, opts), () => hosting.compareRevisions("r", "main", "x", opts)]) {
    await assert.rejects(call(), (e) => e.code === "INVALID_READ");
  }
  assert.equal(calls().length, before, "refused before any call");
  // Each call is gated by the abilities the grant really holds, which the caller cannot choose.
  const small = await granted(["read-contents"], () => ({ status: 200, json: [] }));
  const smallMark = small.api.mark();
  await assert.rejects(hosting.listPullRequests("o/r", { state: "open" }, { grant: small.grant, fetch: small.api.fetch, api: small.api.api }), (e) => e.code === "ABILITY_REFUSED");
  assert.equal(small.api.requests.length, smallMark, "refused before any call");
  await assert.rejects(hosting.readRef("o/r", "kaal/c/b0", { fetch: small.api.fetch, api: small.api.api }), (e) => e.code === "GRANT_UNTRUSTED", "no grant is refused");
  const failing = await granted(["read-contents"], () => ({ status: 502, json: {} }));
  const failMark = failing.api.mark();
  await assert.rejects(hosting.readRef("o/r", "kaal/c/b0", { grant: failing.grant, fetch: failing.api.fetch, api: failing.api.api }), (e) => e.code === "READ_FAILED" && /502/.test(e.message));
  assert.equal(failing.api.requests.length - failMark, 1, "no retry");
});

// hosting/T325 (hosting/C114): a grant cannot be forged, substituted or widened; a call with a grant it does not hold is refused.

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

// hosting/T330 (hosting/C114): a grant is usable for its repository and its origin only.

it("hosting/T330: a grant refuses another repository, another api and another fetch, before any call, and sends its token nowhere else", async () => {
  const { grant, api } = await granted(["read-contents"], () => ({ status: 200, json: { object: { sha: "c".repeat(40) } } }));
  const ok = standIn(() => ({ status: 200, json: { object: { sha: "c".repeat(40) } } }));
  assert.equal(await hosting.readRef("o/r", "main", { grant, fetch: api.fetch, api: api.api }), "c".repeat(40), "the transport it was minted against is accepted");
  for (const [why, call, code] of [
    ["another repository", () => hosting.readRef("o/other", "main", { grant, fetch: api.fetch, api: api.api }), "GRANT_REPO_MISMATCH"],
    ["another api origin", () => hosting.readRef("o/r", "main", { grant, fetch: api.fetch, api: "https://evil.invalid" }), "GRANT_TRANSPORT_MISMATCH"],
    ["another fetch", () => hosting.readRef("o/r", "main", { grant, fetch: ok.fetch, api: api.api }), "GRANT_TRANSPORT_MISMATCH"],
    ["the default origin when it was minted against another", () => hosting.readRef("o/r", "main", { grant, fetch: api.fetch }), "GRANT_TRANSPORT_MISMATCH"],
  ]) {
    const before = api.requests.length + ok.requests.length;
    await assert.rejects(call(), (e) => e.code === code, why);
    assert.equal(api.requests.length + ok.requests.length, before, `${why}: no request was sent anywhere`);
  }
});

// hosting/T331 (hosting/C114): approval identity is enforced by the Approver's own grant, before adoption.

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
