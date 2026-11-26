// hosting/T321 draft (hosting/C114): refusals and named failures of the mint; no secret leaks.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { appWorld, keys } from "./fixtures.mjs";

const { privateKey, verify } = keys();
const base = { app: "dispatcher", appId: "12345", privateKey, repo: "o/r", abilities: ["read-contents"] };

it("hosting/T321: refuses before any call what the caller cannot decide; names the failures; leaks nothing", async () => {
  for (const [why, input] of [
    ["no abilities", { ...base, abilities: [] }],
    ["no key", { ...base, privateKey: "" }],
    ["no App id", { ...base, appId: "" }],
    ["a repo that is not owner/name", { ...base, repo: "r" }],
    ["no app name", { ...base, app: "" }],
    ["a declaration supplied by the caller", { ...base, declaration: { app: "dispatcher", name: "x", owner: "kaal-release", purpose: "x", abilities: ["read-contents", "approve-pull-requests"] } }],
    ["a repository list or permissions supplied by the caller", { ...base, permissions: { pull_requests: "write" } }],
  ]) {
    const api = appWorld({ verify });
    await assert.rejects(hosting.mintToken(input, { fetch: api.fetch, api: api.api }), (e) => e.code === "APP_TOKEN_REFUSED", why);
    assert.equal(api.requests.length, 0, `${why}: nothing was sent`);
  }
  const wrong = [
    ["an ability beyond the declaration on the default branch", { abilities: ["read-contents", "read-checks"] }, {}, "APP_TOKEN_REFUSED"],
    ["an approving ability the App does not declare", { abilities: ["approve-pull-requests"] }, {}, "APP_TOKEN_REFUSED"],
    ["no declaration for the app on the default branch", {}, { declarations: [] }, "APP_DECLARATION_MISSING"],
    ["two declarations of the same app", {}, { declarations: ["a", "b"].map((o) => ({ path: `packages/kaal-${o}/13-source/github-apps/dispatcher.json`, declaration: { app: "dispatcher", name: "D", owner: `kaal-${o}`, purpose: "p", appId: o === "a" ? "1" : "2", abilities: ["read-contents"] } })) }, "APP_DECLARATION_AMBIGUOUS"],
    ["a declaration that is not valid", {}, { declarations: [{ path: "packages/kaal-release/13-source/github-apps/dispatcher.json", declaration: "{not json" }] }, "INVALID_APP_DECLARATION"],
    ["a declaration whose app is another name than its file", {}, { declarations: [{ path: "packages/kaal-release/13-source/github-apps/dispatcher.json", declaration: { app: "other", name: "D", owner: "kaal-release", purpose: "p", abilities: ["read-contents"] } }] }, "INVALID_APP_DECLARATION"],
    ["a truncated tree", {}, { truncated: true }, "APP_DECLARATION_MISSING"],
    ["an installation granted more than the declaration", {}, { installPermissions: { metadata: "read", contents: "read", pull_requests: "write", actions: "write" } }, "APP_INSTALLATION_MISMATCH"],
    ["an installation granted less than the declaration", {}, { installPermissions: { metadata: "read", contents: "read" } }, "APP_INSTALLATION_MISMATCH"],
    ["a returned grant that is empty", {}, { grant: {} }, "APP_GRANT_MISMATCH"],
    ["a returned grant with an extra permission", {}, { grant: { contents: "read", pull_requests: "write" } }, "APP_GRANT_MISMATCH"],
    ["a returned grant with a higher level", {}, { grant: { contents: "write" } }, "APP_GRANT_MISMATCH"],
    ["a returned grant with an unknown permission", {}, { grant: { contents: "read", administration: "write" } }, "APP_GRANT_MISMATCH"],
    ["a token that has already expired", {}, { expiresAt: "2020-01-01T00:00:00Z" }, "APP_GRANT_MISMATCH"],
    ["an expiry that is not a time", {}, { expiresAt: "soon" }, "APP_GRANT_MISMATCH"],
    ["an expiry more than an hour away", {}, { expiresAt: "2099-01-01T00:00:00Z" }, "APP_GRANT_MISMATCH"],
    ["not installed", {}, { _status: { GET: 404 } }, "APP_NOT_INSTALLED"],
    ["a key GitHub rejects", {}, { _status: { GET: 401 } }, "APP_KEY_REJECTED"],
    ["a server error on the token", {}, { _status: { POST: 500 } }, "APP_TOKEN_FAILED"],
    ["a network error", {}, { _status: { POST: "throw" } }, "APP_TOKEN_FAILED"],
  ];
  for (const [why, input, world, code] of wrong) {
    const status = world._status;
    const inner = appWorld({ verify, ...world });
    const api = status ? { ...inner, fetch: async (url, init = {}) => {
      const method = init.method ?? "GET";
      if (status[method] === "throw") throw new Error("socket hang up");
      if (status[method] && method === "GET" && new URL(url).pathname.endsWith("/installation")) return new Response("{}", { status: status[method] });
      if (status[method] && method === "POST") return new Response("{}", { status: status[method] });
      return inner.fetch(url, init);
    } } : inner;
    const out = [];
    const log = console.log; const err = console.error;
    console.log = (...a) => out.push(a.join(" ")); console.error = (...a) => out.push(a.join(" "));
    let error;
    try { await hosting.mintToken({ ...base, ...input }, { fetch: api.fetch, api: inner.api, now: () => 1_800_000_000_000 }); } catch (e) { error = e; } finally { console.log = log; console.error = err; }
    assert.equal(error?.code, code, why);
    const seen = JSON.stringify({ m: error.message, s: error.stack, out });
    assert.doesNotMatch(seen, /PRIVATE KEY|ghs_/, `${why}: no key or token in the error`);
    assert.ok(inner.requests.length <= 7, `${why}: no retry`);
    if (code !== "APP_GRANT_MISMATCH" && code !== "APP_TOKEN_FAILED") assert.equal(inner.requests.filter((r) => r.method === "POST").length <= 1, true, `${why}: the narrowed token was never requested`);
  }
});
