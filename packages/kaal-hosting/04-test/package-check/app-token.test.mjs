import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DISPATCHER, NOW, SHA, SOON, appWorld, keys, mint } from "./app-fixtures.mjs";

// hosting/T320 (hosting/C114): the grant, established from the declaration on the default branch and checked against what GitHub really granted.

const b64 = (s) => Buffer.from(s, "base64url");

it("hosting/T320: mintToken reads the declaration itself from the default branch, asks for the declared abilities only, and returns a grant whose abilities are what GitHub really granted", async () => {
  const { grant, api } = await mint(["read-contents", "raise-pull-requests"]);
  assert.deepEqual(api.requests.map((r) => `${r.method} ${r.path}`), [
    "GET /repos/o/r/installation",
    "POST /app/installations/99/access_tokens",
    "GET /repos/o/r",
    "GET /repos/o/r/commits/main",
    `GET /repos/o/r/git/trees/${SHA}`,
    "GET /repos/o/r/contents/packages/kaal-release/13-source/github-apps/dispatcher.json",
    "POST /app/installations/99/access_tokens",
  ]);
  assert.deepEqual(api.requests[1].body, { permissions: { contents: "read" }, repositories: ["r"] }, "the bootstrap token can only read contents, to read the declaration");
  assert.deepEqual(api.requests[6].body, { permissions: { contents: "read", pull_requests: "write" }, repositories: ["r"] });
  assert.deepEqual(hosting.grantAbilities(grant), ["read-contents", "raise-pull-requests"]);
  assert.equal(grant.expiresAt, SOON);
  assert.ok(Object.isFrozen(grant), "a grant cannot be edited");
  for (const k of Object.keys(grant)) assert.notEqual(k, "token", "the token is not a property of the grant");
  const claims = JSON.parse(b64(api.requests[0].headers.authorization.replace(/^Bearer /, "").split(".")[1]).toString());
  assert.equal(JSON.parse(b64(api.requests[0].headers.authorization.replace(/^Bearer /, "").split(".")[0]).toString()).alg, "RS256");
  assert.equal(String(claims.iss), "12345");
  assert.ok(claims.iat <= NOW / 1000 && claims.exp > NOW / 1000 && claims.exp - claims.iat <= 600);
  assert.equal(DISPATCHER.app, "dispatcher");
});

// hosting/T321 (hosting/C114): refusals and named failures of the mint; no secret leaks.

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

// hosting/T329 (hosting/C114): a GitHub App id is bound to its declaration by the Owner's record, not by the caller's name.

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
