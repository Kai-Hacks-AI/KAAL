// hosting/T322 draft (hosting/C114): the Dispatcher's reads behind Hosting, in Hosting's fact shape.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { granted } from "./fixtures.mjs";

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
