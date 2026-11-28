// Posting a check run as an App (hosting/F112, hosting/A49): one POST of a fixed form, with the authority of a grant Hosting
// minted and nothing else. The caller names the check and the revision and says what it concluded; the status, the App, the
// token and the permissions are not its to name. What GitHub made is verified against what was asked for before it is reported.
import { AppAdapterError } from "./app-error.js";
import { attribute } from "./facts.js";
import { useGrant, grantIdentity } from "./grant.js";

export interface CheckRequest { name: string; revision: string; conclusion: string; title: string; summary: string; externalId?: string }
export interface CheckOptions { grant: unknown; fetch?: typeof fetch; api?: string; now?: () => number }
export interface PostedCheckFact { id: number; name: string; revision: string; conclusion: string; signer: string; externalId?: string }

const REQUEST_KEYS = ["name", "revision", "conclusion", "title", "summary", "externalId"];
const OPTION_KEYS = ["grant", "fetch", "api", "now"];
const CONCLUSIONS = ["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required"];
const SHORT = 255;
const LONG = 65535;
type Json = any; // GitHub's answers; each field is checked where it is read

const invalid = (why: string): never => { throw new AppAdapterError(`the check is invalid: ${why}`, "INVALID_CHECK"); };
const text = (value: unknown, what: string, most: number, line = false): string => {
  if (typeof value !== "string" || value.trim() === "" || value.length > most) return invalid(`${what} is missing, empty or over ${most} characters`);
  if (line && /[\r\n]/.test(value)) return invalid(`${what} has a line break`);
  return value;
};

export async function postCheckRun(repo: string, check: CheckRequest, options: CheckOptions): Promise<PostedCheckFact> {
  if (typeof options !== "object" || options === null) return invalid("the options are not an object");
  const strayOption = Reflect.ownKeys(options).find((k) => typeof k !== "string" || !OPTION_KEYS.includes(k));
  if (strayOption !== undefined) return invalid(`${String(strayOption)} is not an option: the authority of a call is its grant`);
  if (typeof repo !== "string" || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return invalid("the repository is not owner/name");
  // The grant first: a forged one, another repository or a grant without post-checks sends nothing and says so by name.
  const token = useGrant(options.grant, "post-checks", { repo, api: options.api, fetch: options.fetch, now: options.now });
  if (typeof check !== "object" || check === null || Array.isArray(check)) return invalid("the check is not an object");
  // A key is refused for being there, whatever it holds: undefined is a value too.
  const stray = Reflect.ownKeys(check).find((k) => typeof k !== "string" || !REQUEST_KEYS.includes(k));
  if (stray !== undefined) return invalid(`${String(stray)} is not part of a check: Hosting makes the status, the App and the rest`);
  const name = text(check.name, "the name", SHORT, true);
  if (typeof check.revision !== "string" || !/^[0-9a-f]{40}$/.test(check.revision)) return invalid("the revision is not a full lower-case commit id");
  if (typeof check.conclusion !== "string" || !CONCLUSIONS.includes(check.conclusion)) return invalid(`the conclusion is not one of ${CONCLUSIONS.join(", ")}`);
  const title = text(check.title, "the title", SHORT);
  const summary = text(check.summary, "the summary", LONG);
  const externalId = check.externalId === undefined ? undefined : text(check.externalId, "the external id", SHORT);

  const url = `${(options.api ?? "https://api.github.com").replace(/\/+$/, "")}/repos/${repo}/check-runs`;
  const body = { name, head_sha: check.revision, status: "completed", conclusion: check.conclusion, output: { title, summary }, ...(externalId === undefined ? {} : { external_id: externalId }) };
  let response: Response;
  try {
    response = await (options.fetch ?? globalThis.fetch)(url, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "KAAL Hosting", "x-github-api-version": "2022-11-28", "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch { throw new AppAdapterError("posting the check run did not complete", "CHECK_FAILED"); }
  let run: Json = null;
  try { run = await response.json(); } catch { /* an answer that is not JSON is read as nothing */ }
  if (response.status !== 201) {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });
    throw new AppAdapterError(`posting the check run failed (HTTP ${response.status})`, "CHECK_FAILED", { status: response.status, headers });
  }
  const who = grantIdentity(options.grant);
  // The external id is reported only as GitHub returned it: the one asked for, or none (GitHub says none as empty, null or nothing).
  const returned: unknown = run?.external_id;
  const sameExternal = externalId === undefined ? returned === undefined || returned === null || returned === "" : returned === externalId;
  const same = sameExternal && typeof run?.id === "number" && run.name === name && run.head_sha === check.revision && run.status === "completed" && run.conclusion === check.conclusion
    && String(run.app?.id) === who.appId && typeof run.app?.slug === "string" && `${run.app.slug}[bot]` === who.login;
  if (!same) throw new AppAdapterError("GitHub made a check run that is not the one asked for, or not this App's", "CHECK_MISMATCH");
  return attribute({ id: run.id as number, name, revision: check.revision, conclusion: check.conclusion, signer: run.app.slug as string, ...(externalId === undefined ? {} : { externalId }) }, options.grant);
}
