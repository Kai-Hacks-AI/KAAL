// hosting/T320 draft (hosting/C114): the grant, established from the declaration on the default branch and checked against what GitHub really granted.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DISPATCHER, NOW, SHA, SOON, mint } from "./fixtures.mjs";

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
