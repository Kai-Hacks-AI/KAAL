// The reads the Apps make, behind Hosting (hosting/F101, hosting/A45): GET only, one fact shape of Hosting's own, a
// named failure, and the authority of a grant Hosting minted. A call refuses before any request when the grant is not
// Hosting's, has expired, is for another repository or transport, or lacks the ability the call needs.
import { AppAdapterError } from "./app-error.js";
import { useGrant } from "./grant.js";

export interface ReadOptions { grant: unknown; fetch?: typeof fetch; api?: string; now?: () => number }
export interface Compared { status: string; aheadBy: number; behindBy: number; files: string[]; truncated: boolean }
export interface PullRequestFact { number: number; title: string; state: string; merged: boolean; head: { ref: string; sha: string }; base: { ref: string }; body: string }
export interface ReviewFact { state: string; commit: string; by: { login: string; type: string } }

const OPTION_KEYS = ["grant", "fetch", "api", "now"];
const PAGE = 100;
const MAX_PAGES = 50;
const CUT = 300;
type Json = any; // GitHub's answers; each field is read defensively

const invalid = (why: string): never => { throw new AppAdapterError(`the read is invalid: ${why}`, "INVALID_READ"); };
const path = (ref: string): string => ref.split("/").map(encodeURIComponent).join("/");

function checkOptions(options: unknown): ReadOptions {
  if (typeof options !== "object" || options === null) return invalid("the options are not an object");
  const stray = Object.keys(options).find((k) => !OPTION_KEYS.includes(k));
  if (stray) return invalid(`${stray} is not an option: the authority of a call is its grant`);
  return options as ReadOptions;
}
const checkRepo = (repo: unknown): string => (typeof repo === "string" && /^[\w.-]+\/[\w.-]+$/.test(repo) ? repo : invalid("the repository is not owner/name"));
const word = (value: unknown, what: string): string => (typeof value === "string" && value !== "" ? value : invalid(`${what} is missing`));

/** One GET with the grant's token; the answer's status and JSON. A network error is a named failure. */
async function get(repo: string, ability: string, o: ReadOptions, route: string, what: string): Promise<{ status: number; json: Json }> {
  const token = useGrant(o.grant, ability, { repo, api: o.api, fetch: o.fetch, now: o.now });
  const doFetch = o.fetch ?? globalThis.fetch;
  let response;
  try {
    response = await doFetch(`${(o.api ?? "https://api.github.com").replace(/\/+$/, "")}${route}`, {
      method: "GET",
      headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "KAAL Hosting", "x-github-api-version": "2022-11-28" },
    });
  } catch { throw new AppAdapterError(`${what} did not complete`, "READ_FAILED"); }
  let json: Json = null;
  try { json = await response.json(); } catch { /* an answer that is not JSON is read as nothing */ }
  return { status: response.status, json };
}
const failed = (what: string, status: number): never => { throw new AppAdapterError(`${what} failed (HTTP ${status})`, "READ_FAILED"); };

async function pages(repo: string, ability: string, o: ReadOptions, route: (page: number) => string, what: string): Promise<Json[]> {
  const all: Json[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const answer = await get(repo, ability, o, route(page), what);
    if (answer.status !== 200 || !Array.isArray(answer.json)) return failed(what, answer.status);
    all.push(...answer.json);
    if (answer.json.length < PAGE) return all;
  }
  return failed(`${what} (more than ${MAX_PAGES} pages)`, 200);
}

export async function listBranches(repo: string, prefix: string, options: ReadOptions): Promise<string[]> {
  const o = checkOptions(options);
  checkRepo(repo);
  word(prefix, "the prefix");
  const refs = await pages(repo, "read-contents", o, (n) => `/repos/${repo}/git/matching-refs/heads/${path(prefix)}?per_page=${PAGE}&page=${n}`, "listing the branches");
  return refs.map((r) => String(r?.ref ?? "").replace(/^refs\/heads\//, "")).filter((b) => b !== "");
}

export async function compareRevisions(repo: string, base: string, head: string, options: ReadOptions): Promise<Compared> {
  const o = checkOptions(options);
  checkRepo(repo);
  word(base, "the base");
  word(head, "the head");
  const answer = await get(repo, "read-contents", o, `/repos/${repo}/compare/${path(base)}...${path(head)}`, "the comparison");
  const c = answer.json;
  if (answer.status !== 200 || typeof c !== "object" || c === null || !Array.isArray(c.files)) return failed("the comparison", answer.status);
  const files: string[] = c.files.flatMap((f: Json) => (typeof f?.previous_filename === "string" ? [f.filename, f.previous_filename] : [f?.filename])).filter((p: unknown) => typeof p === "string");
  return { status: String(c.status), aheadBy: Number(c.ahead_by), behindBy: Number(c.behind_by), files, truncated: c.files.length >= CUT };
}

export async function listPullRequests(repo: string, query: { state: string; base?: string; head?: string }, options: ReadOptions): Promise<PullRequestFact[]> {
  const o = checkOptions(options);
  checkRepo(repo);
  if (typeof query !== "object" || query === null || !["open", "closed", "all"].includes(query.state)) return invalid("the state is not open, closed or all");
  if (query.head !== undefined && !/^[^:\s]+:[^\s]+$/.test(query.head)) return invalid("the head needs an owner: owner:branch");
  if (query.base !== undefined) word(query.base, "the base");
  const filter = `${query.base === undefined ? "" : `&base=${encodeURIComponent(query.base)}`}${query.head === undefined ? "" : `&head=${encodeURIComponent(query.head)}`}`;
  const all = await pages(repo, "read-pull-requests", o, (n) => `/repos/${repo}/pulls?state=${query.state}${filter}&per_page=${PAGE}&page=${n}`, "listing the pull requests");
  return all.map((p) => ({ number: p.number, title: String(p.title ?? ""), state: String(p.state), merged: p.merged_at != null, head: { ref: String(p.head?.ref ?? ""), sha: String(p.head?.sha ?? "") }, base: { ref: String(p.base?.ref ?? "") }, body: String(p.body ?? "") }));
}

/** The commit a branch points at, or null when the branch does not exist: an absent ref is a fact, not a failure. */
export async function readRef(repo: string, ref: string, options: ReadOptions): Promise<string | null> {
  const o = checkOptions(options);
  checkRepo(repo);
  word(ref, "the ref");
  const answer = await get(repo, "read-contents", o, `/repos/${repo}/git/ref/heads/${path(ref)}`, "reading the ref");
  if (answer.status === 404) return null;
  const sha = answer.json?.object?.sha;
  if (answer.status !== 200 || typeof sha !== "string") return failed("reading the ref", answer.status);
  return sha;
}

/** The reviews of a pull request, as facts only: who reviewed, what they decided and on which commit. Hosting judges none of them. */
export async function listReviews(repo: string, number: number, options: ReadOptions): Promise<ReviewFact[]> {
  const o = checkOptions(options);
  checkRepo(repo);
  if (!Number.isInteger(number) || number < 1) return invalid("the pull request number is not a positive integer");
  const all = await pages(repo, "read-pull-requests", o, (n) => `/repos/${repo}/pulls/${number}/reviews?per_page=${PAGE}&page=${n}`, "listing the reviews");
  return all.map((r) => ({ state: String(r?.state ?? ""), commit: String(r?.commit_id ?? ""), by: { login: String(r?.user?.login ?? ""), type: String(r?.user?.type ?? "") } }));
}
