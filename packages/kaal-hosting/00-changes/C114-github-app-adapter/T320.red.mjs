// hosting/T320 draft (hosting/C114): a minted installation token, narrowed, with a verifiable App JWT.
import assert from "node:assert/strict";
import { createPublicKey, createVerify, generateKeyPairSync } from "node:crypto";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DISPATCHER, standIn } from "./fixtures.mjs";

const b64 = (s) => Buffer.from(s, "base64url");

it("hosting/T320: mintToken finds the installation, signs RS256, and asks for exactly the requested abilities on one repository", async () => {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
  const NOW = 1_800_000_000_000;
  const api = standIn((r) => {
    const jwt = r.headers.authorization?.replace(/^Bearer /, "") ?? "";
    const [h, p, s] = jwt.split(".");
    const ok = createVerify("RSA-SHA256").update(`${h}.${p}`).verify(createPublicKey(publicKey), b64(s));
    if (!ok) return { status: 401, json: { message: "Bad credentials" } };
    if (r.method === "GET" && r.path === "/repos/o/r/installation") return { status: 200, json: { id: 99 } };
    if (r.method === "POST" && r.path === "/app/installations/99/access_tokens") return { status: 201, json: { token: "ghs_INSTALLATION_TOKEN", expires_at: "2026-11-26T15:00:00Z", permissions: {} } };
    return { status: 404, json: {} };
  });
  const result = await hosting.mintToken({ declaration: DISPATCHER, appId: "12345", privateKey, repo: "o/r", abilities: ["read-contents", "raise-pull-requests"] }, { fetch: api.fetch, api: api.api, now: () => NOW });
  assert.deepEqual(result, { token: "ghs_INSTALLATION_TOKEN", expiresAt: "2026-11-26T15:00:00Z", abilities: ["read-contents", "raise-pull-requests"] });
  assert.deepEqual(api.requests.map((r) => `${r.method} ${r.path}`), ["GET /repos/o/r/installation", "POST /app/installations/99/access_tokens"]);
  const claims = JSON.parse(b64(api.requests[0].headers.authorization.split(".")[1]).toString());
  assert.equal(JSON.parse(b64(api.requests[0].headers.authorization.split(".")[0]).toString()).alg, "RS256");
  assert.equal(String(claims.iss), "12345");
  assert.ok(claims.iat <= NOW / 1000, "iat is not in the future");
  assert.ok(claims.exp - claims.iat <= 600, "the JWT lives at most ten minutes");
  assert.ok(claims.exp > NOW / 1000, "and is still valid now");
  assert.deepEqual(api.requests[1].body, { permissions: { contents: "read", pull_requests: "write" }, repositories: ["r"] });
});
