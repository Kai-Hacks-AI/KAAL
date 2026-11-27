// Minting a grant (hosting/F99, hosting/A44). The caller names the App, its id, its key, the repository and the abilities
// it wants, and nothing else. The declaration is read here, from the default branch, through a contents-only token;
// the App's identity is what GitHub says the key belongs to, bound to the owner's record; the installation must hold
// what the declaration lists and no more; and the grant is what GitHub really returned, checked, never what was asked.
import { createSign } from "node:crypto";
import { AppAdapterError } from "./app-error.js";
import { permissionsOf, validateAppDeclaration, type AppDeclaration } from "./app-declaration.js";
import { issue, origin, type Grant } from "./grant.js";

export interface MintRequest { app: string; appId: string; privateKey: string; repo: string; abilities: string[] }
export interface MintOptions { fetch?: typeof fetch; api?: string; now?: () => number }

const REQUEST_KEYS = ["app", "appId", "privateKey", "repo", "abilities"];
const OPTION_KEYS = ["fetch", "api", "now"];
const HOUR = 3_600_000;
const SKEW = 60_000;
const DECLARATION = /^packages\/([^/]+)\/13-source\/github-apps\/([^/]+)\.json$/;
type Json = any; // GitHub's answers; each field is checked where it is read

const refused = (why: string): never => { throw new AppAdapterError(`the token request is refused: ${why}`, "APP_TOKEN_REFUSED"); };
const b64 = (value: string | Buffer): string => Buffer.from(value).toString("base64url");
const strip = (p: unknown): Record<string, unknown> => Object.fromEntries(Object.entries((typeof p === "object" && p !== null ? p : {}) as Record<string, unknown>).filter(([k, v]) => !(k === "metadata" && v === "read")).sort(([x], [y]) => (x < y ? -1 : 1)));
const same = (a: unknown, b: unknown): boolean => JSON.stringify(strip(a)) === JSON.stringify(strip(b));

export async function mintToken(request: MintRequest, options: MintOptions = {}): Promise<Grant> {
  // 1. What the caller may name; anything else is authority and is refused before any call.
  if (typeof request !== "object" || request === null) return refused("the request is not an object");
  if (typeof options !== "object" || options === null) return refused("the options are not an object");
  const stray = Object.keys(request).find((k) => !REQUEST_KEYS.includes(k)) ?? Object.keys(options).find((k) => !OPTION_KEYS.includes(k));
  if (stray) return refused(`${stray} is not something a caller names: it is established from the declaration and from GitHub`);
  const { app, appId, privateKey, repo, abilities } = request;
  if (typeof app !== "string" || !/^[a-z][a-z0-9-]*$/.test(app)) return refused("the App name is missing or invalid");
  if (typeof appId !== "string" || !/^[0-9]+$/.test(appId)) return refused("the App id is missing or invalid");
  if (typeof privateKey !== "string" || privateKey === "") return refused("the key is missing");
  if (typeof repo !== "string" || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return refused("the repository is not owner/name");
  if (!Array.isArray(abilities) || abilities.length === 0 || abilities.some((a) => typeof a !== "string") || new Set(abilities).size !== abilities.length) return refused("the abilities are missing, repeated or not names");

  const now = options.now ?? Date.now;
  const api = origin(options.api);
  const doFetch = options.fetch ?? globalThis.fetch;
  const call = async (method: "GET" | "POST", path: string, bearer: string, body?: unknown): Promise<{ status: number; json: Json }> => {
    let response;
    try {
      response = await doFetch(`${api}${path}`, {
        method,
        headers: { authorization: `Bearer ${bearer}`, accept: "application/vnd.github+json", "user-agent": "KAAL Hosting", "x-github-api-version": "2022-11-28", ...(body === undefined ? {} : { "content-type": "application/json" }) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch { throw new AppAdapterError("the request to GitHub did not complete", "APP_TOKEN_FAILED"); }
    let json: Json = null;
    try { json = await response.json(); } catch { /* an answer that is not JSON is read as nothing */ }
    return { status: response.status, json };
  };
  const failed = (status: number, what: string, notInstalled = false): never => {
    if (status === 401) throw new AppAdapterError("GitHub rejected the App key", "APP_KEY_REJECTED");
    if (status === 404 && notInstalled) throw new AppAdapterError(`the App is not installed on ${repo}`, "APP_NOT_INSTALLED");
    throw new AppAdapterError(`${what} failed (HTTP ${status})`, "APP_TOKEN_FAILED");
  };

  // 2. The App's JWT, and what GitHub says this key's installation is.
  const iat = Math.floor(now() / 1000) - 60;
  const head = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64(JSON.stringify({ iat, exp: iat + 600, iss: appId }));
  let jwt: string;
  try { jwt = `${head}.${claims}.${createSign("RSA-SHA256").update(`${head}.${claims}`).sign(privateKey, "base64url")}`; } catch { throw new AppAdapterError("the App key could not sign", "APP_KEY_REJECTED"); }
  const installation = await call("GET", `/repos/${repo}/installation`, jwt);
  if (installation.status !== 200) return failed(installation.status, "finding the installation", true);
  const found = installation.json;
  if (typeof found?.id !== "number" && typeof found?.id !== "string") throw new AppAdapterError("finding the installation gave no installation", "APP_TOKEN_FAILED");
  const name = repo.split("/")[1] as string;
  const tokenFor = async (bearer: string, permissions: Record<string, string>, what: string): Promise<Json> => {
    const answer = await call("POST", `/app/installations/${found.id}/access_tokens`, bearer, { permissions, repositories: [name] });
    if (answer.status !== 201) return failed(answer.status, what);
    const t = answer.json;
    if (typeof t?.token !== "string" || t.token === "") throw new AppAdapterError(`${what} gave no token`, "APP_GRANT_MISMATCH");
    // What GitHub returned, not what was asked: the permissions, the repository and the time.
    if (!same(t.permissions, permissions)) throw new AppAdapterError(`${what} returned permissions other than the ones asked for`, "APP_GRANT_MISMATCH");
    const names = Array.isArray(t.repositories) ? t.repositories.map((r: Json) => r?.name) : [];
    if (t.repository_selection !== "selected" || names.length !== 1 || names[0] !== name) throw new AppAdapterError(`${what} returned a token for more than ${repo}`, "APP_GRANT_MISMATCH");
    const at = typeof t.expires_at === "string" ? Date.parse(t.expires_at) : NaN;
    if (!Number.isFinite(at) || at <= now() || at > now() + HOUR + SKEW) throw new AppAdapterError(`${what} returned an expiry that is not within the next hour`, "APP_GRANT_MISMATCH");
    return { token: t.token as string, at };
  };

  // 3. The declaration, read by Hosting from the default branch with a token that can only read contents.
  const boot = await tokenFor(jwt, { contents: "read" }, "the bootstrap token");
  const read = async (path: string, what: string): Promise<Json> => {
    const answer = await call("GET", path, boot.token);
    if (answer.status !== 200 || answer.json === null) throw new AppAdapterError(`${what} could not be read (HTTP ${answer.status})`, "APP_DECLARATION_MISSING");
    return answer.json;
  };
  const branch = (await read(`/repos/${repo}`, "the repository")).default_branch;
  if (typeof branch !== "string" || branch === "") throw new AppAdapterError("the default branch is unknown", "APP_DECLARATION_MISSING");
  const sha = (await read(`/repos/${repo}/commits/${branch.split("/").map(encodeURIComponent).join("/")}`, "the default branch")).sha;
  if (typeof sha !== "string" || !/^[0-9a-f]{40}$/.test(sha)) throw new AppAdapterError("the default branch did not resolve to a revision", "APP_DECLARATION_MISSING");
  const tree = await read(`/repos/${repo}/git/trees/${sha}?recursive=1`, "the tree");
  if (tree.truncated !== false || !Array.isArray(tree.tree)) throw new AppAdapterError("the tree is cut off: the declarations are unknown", "APP_DECLARATION_MISSING");
  const files: string[] = tree.tree.filter((e: Json) => e?.type === "blob" && typeof e.path === "string" && DECLARATION.test(e.path)).map((e: Json) => e.path as string);
  const declarations = new Map<string, AppDeclaration[]>();
  for (const path of files) {
    const [, pkg, base] = DECLARATION.exec(path) as RegExpExecArray;
    const file = await read(`/repos/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${sha}`, path);
    let parsed: unknown;
    try { parsed = JSON.parse(Buffer.from(String(file.content ?? ""), "base64").toString("utf8")); } catch { throw new AppAdapterError(`${path} is not JSON`, "INVALID_APP_DECLARATION"); }
    const d = validateAppDeclaration(parsed);
    if (d.app !== base) throw new AppAdapterError(`${path} declares the App ${d.app}, not ${base}`, "INVALID_APP_DECLARATION");
    if (d.owner !== pkg) throw new AppAdapterError(`${path} names the owner ${d.owner}, not ${pkg}`, "INVALID_APP_DECLARATION");
    declarations.set(d.app, [...(declarations.get(d.app) ?? []), d]);
  }
  const own = declarations.get(app) ?? [];
  if (own.length === 0) throw new AppAdapterError(`no declaration of the App ${app} on the default branch of ${repo}`, "APP_DECLARATION_MISSING");
  if (own.length > 1) throw new AppAdapterError(`the App ${app} is declared more than once`, "APP_DECLARATION_AMBIGUOUS");
  const declaration = own[0]!;
  const ids = [...declarations.values()].flat().map((d) => d.appId);
  if (new Set(ids).size !== ids.length) throw new AppAdapterError("two declarations share one App id", "APP_IDENTITY_MISMATCH");

  // 4. Identity: the key's installation belongs to the id the owner recorded, which is the id the caller named.
  if (declaration.appId !== appId || String(found.app_id) !== appId || typeof found.app_slug !== "string" || found.app_slug === "") {
    throw new AppAdapterError(`the key does not belong to the App ${app}: its id, the owner's record and GitHub's answer do not agree`, "APP_IDENTITY_MISMATCH");
  }
  // 5. The installation holds what the declaration lists, no more and no less (the adoption check).
  if (!same(found.permissions, permissionsOf(declaration.abilities))) throw new AppAdapterError(`the installation on ${repo} holds other permissions than the declaration of ${app} lists`, "APP_INSTALLATION_MISMATCH");
  // 6. The abilities asked for are within the declaration; only then the narrowed token is requested.
  const outside = abilities.find((a) => !declaration.abilities.includes(a as never));
  if (outside) return refused(`${outside} is not an ability the declaration of ${app} lists`);
  const permissions = permissionsOf(abilities);
  const final = await tokenFor(jwt, permissions, "the token");
  return issue(app, { token: final.token, abilities, appId, login: `${found.app_slug}[bot]`, repo, origin: api, fetch: doFetch, expiresAt: final.at });
}
