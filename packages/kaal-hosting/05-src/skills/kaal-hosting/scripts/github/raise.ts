// Raising a pull request from the rules its type's owners declared (hosting/F97, hosting/A42). The caller supplies the
// request and a token and nothing else: the revisions, the owners' policy (at the base revision, never the head being
// raised) and the changed paths are established here, and anything unknown refuses before the first write.
import { PullRequestError, renderBody, validateDeclaration, type Declaration } from "./templates.js";

export interface RaiseRequest { repo: string; type: string; chapters: Record<string, string>; head: string; base: string; title: string }
export interface RaiseOptions { token: string; fetch?: typeof fetch; api?: string }
export interface Raised { number: number; url: string; steps: string[] }

/** Where the policy files live in the repository, read at the base revision. */
export const POLICY = {
  typeList: "packages/kaal-engineering/skills/kaal-engineering/references/pull-request-types.json",
  writeAreas: "packages/kaal-engineering/skills/kaal-engineering/references/write-areas.json",
  declaration: (owner: string): string => `packages/${owner}/13-source/pull-request-types/${owner}.json`,
};

const AUTHORITY = ["declarations", "typeList", "writeAreas", "changedPaths", "changed", "policy"];
const MERGE_CHOICE = ["autoMerge", "mergeMethod"];
const DRAFT_CHOICE = ["draft"];
const OPTION_KEYS = ["token", "fetch", "api"];
const CUT = 300;

const refused = (rule: string, message: string, owner?: string): never => { throw new PullRequestError(message, "RAISE_REFUSED", { rule, owner }); };
const has = (o: object, keys: string[]): string | undefined => keys.find((k) => Object.prototype.hasOwnProperty.call(o, k));
const segments = (ref: string): string => ref.split("/").map(encodeURIComponent).join("/");

/** A branch pattern: `*` stands for one whole segment (some characters of it with other text around). */
function globSegment(pattern: string, segment: string): boolean {
  return new RegExp(`^${pattern.split("*").map((p) => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[^/]*")}$`).test(segment);
}
function matches(pattern: string, value: string): boolean {
  const p = pattern.split("/");
  const v = value.split("/");
  return p.length === v.length && p.every((s, i) => globSegment(s, v[i]!));
}
const prefixMatches = (pattern: string, path: string): boolean => {
  const p = pattern.split("/");
  const v = path.split("/");
  return p.length <= v.length && p.every((s, i) => globSegment(s, v[i]!));
};

type Json = any; // GitHub's and the owners' JSON; each field is checked where it is read

export async function raisePullRequest(request: RaiseRequest, options: RaiseOptions): Promise<Raised> {
  // 1. What the caller may not supply, and the token: refused before any call, not even a read.
  for (const [where, o] of [["request", request], ["options", options]] as const) {
    if (typeof o !== "object" || o === null) return refused("request", `the ${where} is not an object`);
    const authority = has(o, AUTHORITY);
    if (authority) return refused("caller-authority", `${authority} is authority; it is read from the base revision, not supplied by the caller`);
    const merge = has(o, MERGE_CHOICE);
    if (merge) return refused("caller-merge-choice", `${merge} is the owner's declaration to make, not the caller's`);
    const draft = has(o, DRAFT_CHOICE);
    if (draft) return refused("caller-draft-choice", "draft is the owner's declaration to make, not the caller's");
  }
  const unknownOption = Object.keys(options).find((k) => !OPTION_KEYS.includes(k));
  if (unknownOption) return refused("caller-authority", `the option ${unknownOption} is not a transport option`);
  if (typeof options.token !== "string" || options.token === "") return refused("token", "a token is needed to raise a pull request");
  const { repo, type, chapters, head, base, title } = request;
  if (typeof repo !== "string" || !/^[\w.-]+\/[\w.-]+$/.test(repo) || [type, head, base, title].some((s) => typeof s !== "string" || s === "") || typeof chapters !== "object" || chapters === null) {
    return refused("request", "the request needs repo (owner/name), type, chapters, head, base and title");
  }

  const api = (options.api ?? "https://api.github.com").replace(/\/$/, "");
  const doFetch = options.fetch ?? globalThis.fetch;
  const headers = { authorization: `Bearer ${options.token}`, accept: "application/vnd.github+json", "user-agent": "KAAL Hosting", "x-github-api-version": "2022-11-28" };
  const call = async (method: "GET" | "POST", path: string, body?: unknown): Promise<{ status: number; json: Json }> => {
    const response = await doFetch(`${api}${path}`, { method, headers: body === undefined ? headers : { ...headers, "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    let json: Json = null;
    try { json = await response.json(); } catch { /* an answer that is not JSON is read as nothing */ }
    return { status: response.status, json };
  };
  const read = async (path: string, rule: string, owner: string | undefined, what: string): Promise<Json> => {
    let answer;
    try { answer = await call("GET", path); } catch { return refused(rule, `${what} could not be read`, owner); }
    if (answer.status !== 200 || answer.json === null) return refused(rule, `${what} could not be read (HTTP ${answer.status})`, owner);
    return answer.json;
  };

  // 2. The revisions and the diff between them.
  const revision = async (ref: string, what: string): Promise<string> => {
    const sha = (await read(`/repos/${repo}/commits/${segments(ref)}`, "revision", undefined, `the ${what} ${ref}`)).sha;
    return typeof sha === "string" && /^[0-9a-f]{40}$/.test(sha) ? sha : refused("revision", `the ${what} ${ref} did not resolve to a revision`);
  };
  const headSha = await revision(head, "head");
  const baseSha = await revision(base, "base");
  const compared = await read(`/repos/${repo}/compare/${baseSha}...${headSha}`, "revision", undefined, "the comparison of the revisions");
  const changed: unknown = Array.isArray(compared.files) ? compared.files.map((f: Json) => f?.filename) : undefined;
  if (!Array.isArray(changed) || changed.some((p) => typeof p !== "string")) return refused("revision", "the comparison did not list its files");
  if (changed.length >= CUT) return refused("revision", `the comparison lists ${changed.length} files, where GitHub cuts the list: the changed paths are unknown`);

  // 3. The owners' policy, at the base revision.
  const policy = async (path: string, rule: string, owner: string | undefined, what: string): Promise<Json> => {
    const file = await read(`/repos/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${baseSha}`, rule, owner, what);
    if (typeof file.content !== "string" || file.encoding !== "base64") return refused(rule, `${what} is not a file`, owner);
    try { return JSON.parse(Buffer.from(file.content, "base64").toString("utf8")); } catch { return refused(rule, `${what} is not JSON`, owner); }
  };
  const typeList = await policy(POLICY.typeList, "type-list", "engineering", "the list of pull request types");
  const listed = Array.isArray(typeList.types) ? typeList.types.find((t: Json) => t?.type === type) : undefined;
  if (!listed || (Array.isArray(typeList.invalid) && typeList.invalid.includes(type)) || typeof listed.owner !== "string") {
    return refused("type-list", `${type} is not a pull request type this repository lists`, "engineering");
  }
  const owner: string = listed.owner;
  const declared = await policy(POLICY.declaration(owner), "declaration", owner, `the declaration file of ${owner}`);
  const found = Array.isArray(declared.types) ? declared.types.find((t: Json) => t?.type === type) : undefined;
  if (!found) return refused("declaration", `${owner} does not declare ${type}`, owner);
  let declaration: Declaration;
  try { declaration = validateDeclaration(found); } catch (e) { return refused("declaration", `${owner}'s declaration of ${type} is invalid: ${(e as Error).message}`, owner); }
  const areas = await policy(POLICY.writeAreas, "write-areas", "engineering", "the write areas");

  // 4. The owners' rules, checked before the first write.
  const rules = declaration.raise ?? {};
  if (rules.head && !rules.head.some((p) => matches(p, head))) return refused("head", `${head} is not a head a ${type} may be raised from`, owner);
  if (rules.base && !rules.base.some((p) => matches(p, base))) return refused("base", `${base} is not a base a ${type} may be raised into`, owner);
  const forbidden = rules.title?.forbid?.find((p) => new RegExp(p).test(title));
  if (forbidden) return refused("title", `the title breaks the rule ${forbidden}`, owner);
  let body: string;
  try { body = renderBody(declaration, chapters); } catch (e) { return refused("chapters", (e as Error).message, owner); }
  boundary(type, changed as string[], areas);

  // 5. Open the pull request, then enable the declared auto-merge: two steps, never bent into one call.
  const steps: string[] = [];
  let opened: Json;
  try {
    const answer = await call("POST", `/repos/${repo}/pulls`, { title, head, base, body, draft: rules.draft ?? false });
    if (answer.status !== 201 || typeof answer.json?.number !== "number") throw new PullRequestError(`opening the pull request failed (HTTP ${answer.status})`, "STEP_FAILED", { steps, failed: "open" });
    opened = answer.json;
  } catch (e) {
    if (e instanceof PullRequestError) throw e;
    throw new PullRequestError("opening the pull request failed: the request did not complete", "STEP_FAILED", { steps, failed: "open" });
  }
  steps.push("open");
  const exists = { number: opened.number as number, url: opened.html_url as string };
  if (opened.head?.sha !== headSha) throw new PullRequestError(`the pull request opened on ${String(opened.head?.sha)}, not on the revision ${headSha} that was checked; nothing more is done`, "STEP_FAILED", { steps: [...steps], failed: "revision", ...exists });
  const method = rules.autoMerge ?? "none";
  if (method !== "none") {
    const failure = (why: string) => new PullRequestError(`enabling auto-merge failed: ${why}`, "STEP_FAILED", { steps: [...steps], failed: "auto-merge", ...exists });
    let answer;
    try {
      answer = await call("POST", "/graphql", {
        query: "mutation($pullRequestId: ID!, $mergeMethod: PullRequestMergeMethod!) { enablePullRequestAutoMerge(input: { pullRequestId: $pullRequestId, mergeMethod: $mergeMethod }) { pullRequest { number } } }",
        variables: { pullRequestId: opened.node_id, mergeMethod: method.toUpperCase() },
      });
    } catch { throw failure("the request did not complete"); }
    if (answer.status !== 200) throw failure(`HTTP ${answer.status}`);
    if (Array.isArray(answer.json?.errors) && answer.json.errors.length > 0) throw failure(String(answer.json.errors[0]?.message ?? "refused"));
    steps.push("auto-merge");
  }
  return { ...exists, steps };
}

/** Every changed path lies in an area whose phase the type may carry (engineering/C36's `areas`, `legacy` and `pullRequests`). */
function boundary(type: string, changed: string[], areas: Json): void {
  const owner = "engineering";
  const may = Array.isArray(areas.pullRequests) ? areas.pullRequests.find((p: Json) => p?.type === type)?.may : undefined;
  if (!Array.isArray(may) || !Array.isArray(areas.areas)) return refused("write-areas", `the write areas do not say what a ${type} may carry`, owner);
  if (changed.length === 0) return refused("write-areas", "the comparison lists no changed path, so there is nothing a pull request could carry", owner);
  const legacy: Record<string, string> = typeof areas.legacy === "object" && areas.legacy !== null ? areas.legacy : {};
  for (const path of changed) {
    const m = /^packages\/[^/]+\/(.+)$/.exec(path);
    if (!m) return refused("write-areas", `${path} is outside every package, so no area covers it`, owner);
    let rest = m[1]!;
    for (const [from, to] of Object.entries(legacy)) if (rest === from || rest.startsWith(`${from}/`)) { rest = to + rest.slice(from.length); break; }
    const covering = (areas.areas as Json[]).filter((a) => typeof a?.path === "string" && prefixMatches(a.path, rest)).sort((a, b) => b.path.split("/").length - a.path.split("/").length)[0];
    if (!covering) return refused("write-areas", `${path} is in no write area`, owner);
    if (typeof covering.phase !== "string") return refused("write-areas", `${path} is in the area ${covering.path}, which belongs to another transition or capability`, owner);
    if (!may.includes(covering.phase)) return refused("write-areas", `${path} is in the area ${covering.path} (${covering.phase}), which a ${type} may not carry`, owner);
  }
}
