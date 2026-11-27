// hosting/C114 shared fixtures for the App adapter Cases (T318 to T331). Plain data and a local stand-in for GitHub's API;
// nothing here reaches the network, and every key is generated inside the Case.
export const DISPATCHER = {
  app: "dispatcher",
  name: "KAAL Dispatcher",
  owner: "kaal-release",
  purpose: "Raises pull requests to the next station.",
  appId: "12345",
  abilities: ["read-contents", "read-pull-requests", "raise-pull-requests"],
  logo: "13-source/github-apps/dispatcher.png",
};

/** A recording stand-in. `route(req)` returns `{ status, json }`; it may throw to simulate a network error. */
export function standIn(route) {
  const requests = [];
  const fetch = async (url, init = {}) => {
    const u = new URL(url);
    const req = { method: init.method ?? "GET", path: decodeURIComponent(u.pathname), query: Object.fromEntries(u.searchParams), headers: Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v])), body: init.body ? JSON.parse(init.body) : undefined };
    requests.push(req);
    const { status, json } = route(req);
    return new Response(JSON.stringify(json), { status, headers: { "content-type": "application/json" } });
  };
  return { fetch, requests, api: "https://stand-in.invalid" };
}

/** A PNG whose header says `width` by `height`; the rest is not a picture and need not be. */
export function png(width, height) {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "ascii");
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  b.writeUInt8(8, 24);
  b.writeUInt8(6, 25);
  return new Uint8Array(b);
}

export const NOW = 1_800_000_000_000;
export const SOON = new Date(NOW + 3_600_000).toISOString().replace(/\.\d+Z$/, "Z");
export const SHA = "d".repeat(40);
export const PATH = "packages/kaal-release/13-source/github-apps/dispatcher.json";
export const PERMISSIONS = { metadata: "read", contents: "read", pull_requests: "write" };

/**
 * The App side of GitHub, as one stand-in. The authority is read where Hosting must read it: the declaration from the
 * default branch of the repository (never from the caller), the installation's granted permissions, and the grant
 * GitHub actually returns. Every knob is a way GitHub, or a bad adoption, can differ from the declaration.
 * `publicKey` verifies every App JWT; a request without a good JWT or a bootstrap/installation token is 401.
 */
export function appWorld({ verify, declaration = DISPATCHER, declarations, installPermissions = PERMISSIONS, appId = "12345", installAppId = Number(appId), slug = "kaal-dispatcher", grant, expiresAt = SOON, tree, truncated = false, defaultBranch = "main", fallback }) {
  const entries = tree ?? (declarations ?? [{ path: PATH, declaration }]).map((d) => ({ path: d.path, type: "blob", sha: "e".repeat(40), declaration: d.declaration }));
  let minted = 0;
  return standIn((r) => {
    const auth = r.headers.authorization?.replace(/^Bearer /, "") ?? "";
    const isJwt = auth.split(".").length === 3;
    if (isJwt && !verify(auth)) return { status: 401, json: { message: "Bad credentials" } };
    if (!isJwt && !auth.startsWith("ghs_BOOT") && !auth.startsWith("ghs_GRANT")) return { status: 401, json: { message: "Bad credentials" } };
    if (r.method === "GET" && r.path === "/app") return { status: 200, json: { id: Number(appId), slug: slug, name: "KAAL App" } };
    if (r.method === "GET" && r.path === "/repos/o/r/installation") return { status: 200, json: { id: 99, app_id: installAppId, app_slug: slug, permissions: installPermissions, repository_selection: "selected" } };
    if (r.method === "POST" && r.path === "/app/installations/99/access_tokens") {
      minted += 1;
      const asked = r.body.permissions;
      return { status: 201, json: { token: minted === 1 ? "ghs_BOOT" : "ghs_GRANT", expires_at: expiresAt, permissions: minted === 1 ? asked : (grant ?? asked), repository_selection: "selected", repositories: [{ name: "r" }] } };
    }
    if (r.method === "GET" && r.path === "/repos/o/r") return { status: 200, json: { default_branch: defaultBranch } };
    if (r.method === "GET" && r.path === `/repos/o/r/commits/${defaultBranch}`) return { status: 200, json: { sha: SHA } };
    if (r.method === "GET" && r.path === `/repos/o/r/git/trees/${SHA}`) return { status: 200, json: { truncated, tree: entries.map(({ path, type, sha }) => ({ path, type, sha })) } };
    const hit = entries.find((e) => r.path === `/repos/o/r/contents/${e.path}` && r.query.ref === SHA);
    if (r.method === "GET" && hit) return { status: 200, json: { encoding: "base64", content: Buffer.from(typeof hit.declaration === "string" ? hit.declaration : JSON.stringify(hit.declaration)).toString("base64") } };
    return fallback ? fallback(r) : { status: 404, json: { message: "Not Found" } };
  });
}

import { createPublicKey, createVerify, generateKeyPairSync } from "node:crypto";
import * as hosting from "@kaihacksai/kaal-hosting";

let pair;
/** One generated key pair for the run of a Case file; never a file, never an environment variable. */
export function keys() {
  pair ??= generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
  const verify = (jwt) => { const [h, p, s] = jwt.split("."); return createVerify("RSA-SHA256").update(`${h}.${p}`).verify(createPublicKey(pair.publicKey), Buffer.from(s, "base64url")); };
  return { privateKey: pair.privateKey, verify };
}

/**
 * Mint through the public door against the stand-in; the grant is whatever `mintToken` returns. A grant is bound to the
 * transport it was minted against, so a Case that then uses the grant (reads, raise) gives `world.fallback` its own routes
 * and uses the returned `api` (the same fetch and origin) for them; `api.requests` then holds the mint's calls first and
 * `api.mark()` returns how many there were.
 */
export async function mint(abilities, world = {}, extra = {}) {
  const { privateKey, verify } = keys();
  const api = appWorld({ verify, ...world });
  api.mark = () => api.requests.length;
  const grant = await hosting.mintToken({ app: "dispatcher", appId: "12345", privateKey, repo: "o/r", abilities, ...extra }, { fetch: api.fetch, api: api.api, now: () => NOW });
  const used = api.requests.length;
  api.mark = () => used;
  return { grant, api };
}

/** A grant minted on a world whose other routes are `route`; use the returned `api` (same fetch, same origin) for the calls the grant is then used for. */
export const granted = (abilities, route, world = {}, extra = {}) => mint(abilities, { ...world, fallback: route }, extra);
