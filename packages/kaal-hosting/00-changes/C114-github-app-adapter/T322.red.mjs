// hosting/T322 draft (hosting/C114): the Dispatcher's reads behind Hosting, in Hosting's fact shape.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { standIn } from "./fixtures.mjs";

const auth = { token: "ghs_T", abilities: ["read-contents", "read-pull-requests"] };
const refs = (from, to) => Array.from({ length: to - from }, (_, i) => ({ ref: `refs/heads/kaal/c/b${from + i}`, object: { sha: "a".repeat(40) } }));

it("hosting/T322: listBranches, compareRevisions, listPullRequests and readRef send the documented GET requests, page to a short page and return only facts", async () => {
  const api = standIn((r) => {
    if (r.path === "/repos/o/r/git/matching-refs/heads/kaal/") return { status: 200, json: r.query.page === "1" ? refs(0, 100) : refs(100, 101) };
    if (r.path === "/repos/o/r/compare/main...kaal/c/b0") return { status: 200, json: { ahead_by: 3, behind_by: 1, status: "diverged", files: [{ filename: "a.md", sha: "x", additions: 1 }], commits: [{ sha: "ignored" }] } };
    if (r.path === "/repos/o/r/pulls") return { status: 200, json: [{ number: 5, title: "PLAN", state: "closed", merged_at: "2026-11-25T10:00:00Z", user: { login: "x" }, head: { ref: "claude/w", sha: "b".repeat(40), repo: {} }, base: { ref: "kaal/c/b0" }, body: "b", labels: [{ name: "ignored" }] }] };
    if (r.path === "/repos/o/r/git/ref/heads/kaal/c/b0") return { status: 200, json: { object: { sha: "c".repeat(40) } } };
    if (r.path === "/repos/o/r/git/ref/heads/kaal/c/gone") return { status: 404, json: { message: "Not Found" } };
    return { status: 500, json: {} };
  });
  const opts = { ...auth, fetch: api.fetch, api: api.api };
  const branches = await hosting.listBranches("o/r", "kaal/", opts);
  assert.equal(branches.length, 101);
  assert.equal(branches[0], "kaal/c/b0");
  assert.deepEqual(api.requests.map((r) => `${r.path}?page=${r.query.page}&per_page=${r.query.per_page}`), ["/repos/o/r/git/matching-refs/heads/kaal/?page=1&per_page=100", "/repos/o/r/git/matching-refs/heads/kaal/?page=2&per_page=100"]);
  assert.deepEqual(await hosting.compareRevisions("o/r", "main", "kaal/c/b0", opts), { status: "diverged", aheadBy: 3, behindBy: 1, files: ["a.md"], truncated: false });
  assert.deepEqual(await hosting.listPullRequests("o/r", { state: "closed", base: "kaal/c/b0" }, opts), [{ number: 5, title: "PLAN", state: "closed", merged: true, head: { ref: "claude/w", sha: "b".repeat(40) }, base: { ref: "kaal/c/b0" }, body: "b" }]);
  const last = api.requests.at(-1);
  assert.deepEqual({ state: last.query.state, base: last.query.base }, { state: "closed", base: "kaal/c/b0" });
  assert.equal(await hosting.readRef("o/r", "kaal/c/b0", opts), "c".repeat(40));
  assert.equal(await hosting.readRef("o/r", "kaal/c/gone", opts), null, "an absent ref is a fact, not a failure");
  assert.ok(api.requests.every((r) => r.method === "GET" && r.headers.authorization === "Bearer ghs_T"), "GET only, token only in the header");

  const before = api.requests.length;
  for (const call of [() => hosting.listPullRequests("o/r", { state: "everything" }, opts), () => hosting.listBranches("o/r", "", opts), () => hosting.listPullRequests("o/r", { state: "open", head: "branch-without-owner" }, opts), () => hosting.compareRevisions("r", "main", "x", opts)]) {
    await assert.rejects(call(), (e) => e.code === "INVALID_READ");
  }
  assert.equal(api.requests.length, before, "refused before any call");
  // Each call is gated by the ability the token was minted with, since GitHub will not: the read-only ability set cannot call what it was not given.
  const none = standIn(() => ({ status: 200, json: [] }));
  for (const [call, held] of [[(o) => hosting.listBranches("o/r", "kaal/", o), ["read-pull-requests"]], [(o) => hosting.compareRevisions("o/r", "main", "kaal/c/b0", o), ["read-pull-requests"]], [(o) => hosting.readRef("o/r", "kaal/c/b0", o), []], [(o) => hosting.listPullRequests("o/r", { state: "open" }, o), ["read-contents"]]]) {
    await assert.rejects(call({ token: "ghs_T", abilities: held, fetch: none.fetch, api: none.api }), (e) => e.code === "ABILITY_REFUSED");
  }
  assert.equal(none.requests.length, 0, "refused before any call");
  await assert.rejects(hosting.readRef("o/r", "kaal/c/b0", { token: "ghs_T", fetch: none.fetch, api: none.api }), (e) => e.code === "ABILITY_REFUSED", "a call without the token's abilities is refused");
  const failing = standIn(() => ({ status: 502, json: {} }));
  await assert.rejects(hosting.readRef("o/r", "kaal/c/b0", { ...auth, fetch: failing.fetch, api: failing.api }), (e) => e.code === "READ_FAILED" && /502/.test(e.message));
  assert.equal(failing.requests.length, 1, "no retry");
});
