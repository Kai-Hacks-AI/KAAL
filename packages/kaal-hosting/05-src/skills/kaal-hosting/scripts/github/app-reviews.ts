// Approving a pull request as an App (hosting/F114, hosting/A51): one POST of a fixed form, bound to a named commit, with the
// authority of a grant Hosting minted and nothing else. The caller names the pull request, the commit it approves and an optional
// note; the event, the App and the token are not its to name. What GitHub made is verified against what was asked for before it
// is reported. Hosting decides nothing about whether the pull request should be approved.
import { AppAdapterError } from "./app-error.js";
import { attribute } from "./facts.js";
import { useGrant, grantIdentity } from "./grant.js";

export interface ReviewRequest { revision: string; event: "APPROVE"; body?: string }
export interface ReviewOptions { grant: unknown; fetch?: typeof fetch; api?: string; now?: () => number }
export interface PostedReviewFact { id: number; number: number; revision: string; state: "APPROVED"; reviewer: { login: string; type: string } }

const REQUEST_KEYS = ["revision", "event", "body"];
const OPTION_KEYS = ["grant", "fetch", "api", "now"];
const LONG = 65535;
type Json = any; // GitHub's answers; each field is checked where it is read

const invalid = (why: string): never => { throw new AppAdapterError(`the review is invalid: ${why}`, "INVALID_REVIEW"); };
const stray = (o: object, allowed: string[]): string | undefined => {
  // A key is refused for being there, whatever it holds: undefined is a value too, and so is a symbol key.
  const k = Reflect.ownKeys(o).find((key) => typeof key !== "string" || !allowed.includes(key));
  return k === undefined ? undefined : String(k);
};

export async function postReview(repo: string, number: number, review: ReviewRequest, options: ReviewOptions): Promise<PostedReviewFact> {
  if (typeof options !== "object" || options === null) return invalid("the options are not an object");
  const badOption = stray(options, OPTION_KEYS);
  if (badOption !== undefined) return invalid(`${badOption} is not an option: the authority of a call is its grant`);
  if (typeof repo !== "string" || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return invalid("the repository is not owner/name");
  // The grant first: a forged one, another repository or a grant without approve-pull-requests sends nothing and says so by name.
  const token = useGrant(options.grant, "approve-pull-requests", { repo, api: options.api, fetch: options.fetch, now: options.now });
  if (!Number.isSafeInteger(number) || number < 1) return invalid("the pull request number is not a positive whole number");
  if (typeof review !== "object" || review === null || Array.isArray(review)) return invalid("the review is not an object");
  const badKey = stray(review, REQUEST_KEYS);
  if (badKey !== undefined) return invalid(`${badKey} is not part of a review: Hosting makes the App and the rest`);
  if (typeof review.revision !== "string" || !/^[0-9a-f]{40}$/.test(review.revision)) return invalid("the revision is not a full lower-case commit id");
  if (review.event !== "APPROVE") return invalid("the event is not APPROVE");
  if (review.body !== undefined && (typeof review.body !== "string" || review.body.trim() === "" || review.body.length > LONG)) return invalid(`the body is empty, not text or over ${LONG} characters`);

  const url = `${(options.api ?? "https://api.github.com").replace(/\/+$/, "")}/repos/${repo}/pulls/${number}/reviews`;
  const body = { commit_id: review.revision, event: "APPROVE", ...(review.body === undefined ? {} : { body: review.body }) };
  let response: Response;
  try {
    response = await (options.fetch ?? globalThis.fetch)(url, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "KAAL Hosting", "x-github-api-version": "2022-11-28", "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch { throw new AppAdapterError("posting the review did not complete", "REVIEW_FAILED"); }
  let made: Json = null;
  try { made = await response.json(); } catch { /* an answer that is not JSON is read as nothing */ }
  if (response.status !== 200) {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });
    throw new AppAdapterError(`posting the review failed (HTTP ${response.status})`, "REVIEW_FAILED", { status: response.status, headers });
  }
  const who = grantIdentity(options.grant);
  // What GitHub made must be the approval asked for, of that commit, by the App whose grant posted it.
  const same = typeof made?.id === "number" && made.state === "APPROVED" && made.commit_id === review.revision
    && made.user?.login === who.login && made.user?.type === "Bot";
  if (!same) throw new AppAdapterError("GitHub made a review that is not the approval asked for, or not this App's", "REVIEW_MISMATCH");
  return attribute({ id: made.id as number, number, revision: review.revision, state: "APPROVED" as const, reviewer: Object.freeze({ login: who.login, type: "Bot" }) }, options.grant);
}
