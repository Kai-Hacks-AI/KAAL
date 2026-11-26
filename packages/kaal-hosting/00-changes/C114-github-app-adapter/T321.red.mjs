// hosting/T321 draft (hosting/C114): refusals and named failures of the token mint; no secret leaks.
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DISPATCHER, standIn } from "./fixtures.mjs";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
const base = { declaration: DISPATCHER, appId: "12345", privateKey, repo: "o/r", abilities: ["read-contents"] };
const ok = (r) => (r.method === "GET" ? { status: 200, json: { id: 99 } } : { status: 201, json: { token: "ghs_T", expires_at: "x" } });

it("hosting/T321: refuses before any call what the declaration does not allow; names the failures; leaks nothing", async () => {
  for (const [why, input] of [
    ["an ability beyond the declaration", { ...base, abilities: ["read-contents", "read-checks"] }],
    ["no abilities", { ...base, abilities: [] }],
    ["no key", { ...base, privateKey: "" }],
    ["no App id", { ...base, appId: "" }],
    ["a repo that is not owner/name", { ...base, repo: "r" }],
  ]) {
    const api = standIn(ok);
    await assert.rejects(hosting.mintToken(input, { fetch: api.fetch, api: api.api }), (e) => e.code === "APP_TOKEN_REFUSED", why);
    assert.equal(api.requests.length, 0, `${why}: nothing was sent`);
  }
  const statuses = [
    ["not installed", (r) => (r.method === "GET" ? { status: 404, json: { message: "Not Found" } } : ok(r)), "APP_NOT_INSTALLED"],
    ["a key GitHub rejects on the installation lookup", (r) => (r.method === "GET" ? { status: 401, json: { message: "Bad credentials" } } : ok(r)), "APP_KEY_REJECTED"],
    ["a key GitHub rejects on the token request", (r) => (r.method === "POST" ? { status: 401, json: { message: "Bad credentials" } } : ok(r)), "APP_KEY_REJECTED"],
    ["a server error", (r) => (r.method === "POST" ? { status: 500, json: { message: "boom" } } : ok(r)), "APP_TOKEN_FAILED"],
    ["a network error", (r) => { if (r.method === "POST") throw new Error("socket hang up"); return ok(r); }, "APP_TOKEN_FAILED"],
  ];
  for (const [why, route, code] of statuses) {
    const api = standIn(route);
    const out = [];
    const log = console.log; const err = console.error;
    console.log = (...a) => out.push(a.join(" ")); console.error = (...a) => out.push(a.join(" "));
    let error;
    try { await hosting.mintToken(base, { fetch: api.fetch, api: api.api }); } catch (e) { error = e; } finally { console.log = log; console.error = err; }
    assert.equal(error?.code, code, why);
    const seen = JSON.stringify({ m: error.message, s: error.stack, out });
    assert.doesNotMatch(seen, /PRIVATE KEY|ghs_T/, `${why}: no key or token in the error`);
    for (const r of api.requests) assert.doesNotMatch(seen, new RegExp(r.headers.authorization.replace(/^Bearer /, "").slice(0, 20)), `${why}: no JWT`);
    assert.ok(api.requests.length <= 2, `${why}: no retry`);
  }
});
