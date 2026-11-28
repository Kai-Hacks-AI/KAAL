// hosting/C210 executable drafts (T360 to T363): one typed platform failure. RED on `main`: `classifyPlatformFailure` does not exist and
// an adapter error carries no `failure`. The adapter Cases use the App fixtures of hosting/C114 and the Case drafts of hosting/C174, so
// they run once those are on `main`. The DO turns them into delivered Cases unchanged (`04-test/package-check/platform-failure.test.mjs`).
// Nothing reaches GitHub.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DISPATCHER, granted } from "../../04-test/package-check/app-fixtures.mjs";

const ctx = { asked: "read the rules of branch main in o/r", place: "GET /repos/{repo}/rules/branches/{branch}" };
const classify = (answer, extra = {}) => hosting.classifyPlatformFailure(answer, { ...ctx, ...extra });
const KEYS = ["kind", "basis", "asked", "place", "status", "platformMessage", "ambiguous", "limit"];
const LIMIT_KEYS = ["bucket", "remaining", "resetAt", "retryAfterSeconds"];
const DEPENDENCY_REVIEW = "Dependency review is not supported on this repository. Please ensure that Dependency graph is enabled, see https://github.com/o/r/settings/security_analysis";

it("hosting/T360: an API answer is classified by its status and headers into one of the six kinds, and a success is no failure", () => {
  const f = (status, headers = {}, body = { message: "GitHub's words" }) => classify({ status, headers, body });
  const limited = f(403, { "Retry-After": "30", "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1800000600", "x-ratelimit-resource": "core" });
  assert.deepEqual(limited, { kind: "rate-limited", basis: "answer", ...ctx, status: 403, platformMessage: "GitHub's words", limit: { bucket: "core", remaining: 0, resetAt: new Date(1800000600 * 1000).toISOString(), retryAfterSeconds: 30 } });
  assert.equal(Object.isFrozen(limited) && Object.isFrozen(limited.limit), true);
  assert.equal(f(403, { "x-ratelimit-remaining": "0" }).kind, "rate-limited", "a 403 with no requests left is a limit");
  assert.equal(f(429).kind, "rate-limited", "a 429 is a limit even with no header");
  assert.deepEqual(f(429).limit, { bucket: "unknown" }, "what the headers did not say is not invented");
  assert.equal(f(403, { "x-ratelimit-remaining": "17" }).kind, "forbidden", "a 403 with requests left and no retry-after is a refusal");
  assert.equal(f(401).kind, "forbidden");
  assert.equal(f(404).kind, "not-found");
  for (const s of [400, 409, 410, 422, 500, 502, 503]) assert.deepEqual([f(s).kind, f(s).basis, f(s).status], ["other", "answer", s], `HTTP ${s}`);
  assert.deepEqual(classify({ error: new Error("socket closed") }), { kind: "network", basis: "answer", ...ctx });
  for (const s of [200, 201, 204, 301]) assert.equal(classify({ status: s }), undefined, `HTTP ${s} is no failure`);
  assert.equal(classify({}), undefined, "nothing shown, nothing classified");
  for (const bad of [{}, { asked: "", place: "p" }, { asked: "a", place: " " }, { asked: 1, place: "p" }, { place: "p" }]) assert.throws(() => hosting.classifyPlatformFailure({ status: 500 }, bad), TypeError, JSON.stringify(bad));
});

it("hosting/T361: the text of a check that is not an API answer is classified without taking a claim for a cause, and an exhausted budget outweighs the claim (today's Dependency Review)", () => {
  const rate = classify({ text: "API rate limit exceeded for installation. If you reach out to GitHub Support for help" });
  assert.deepEqual([rate.kind, rate.basis, rate.limit.bucket], ["rate-limited", "text", "unknown"], "a limit that says so");
  assert.equal(classify({ text: "You have exceeded a secondary rate limit." }).kind, "rate-limited");
  // The misleading message: it claims a setting; the same check passed on a re-run with nothing changed.
  const asked = { asked: "run Dependency Review at 0b8e39d", place: "workflow job Dependency Review" };
  const claimed = (extra) => hosting.classifyPlatformFailure({ text: DEPENDENCY_REVIEW, ...extra }, asked);
  const exhausted = claimed({ budget: { remaining: 0, limit: 5000, resetAt: "2026-11-28T09:00:00.000Z", bucket: "core" } });
  assert.deepEqual([exhausted.kind, exhausted.basis, exhausted.ambiguous], ["rate-limited", "budget", undefined]);
  assert.deepEqual(exhausted.limit, { bucket: "core", remaining: 0, resetAt: "2026-11-28T09:00:00.000Z" });
  assert.match(exhausted.platformMessage, /^Dependency review is not supported on this repository/, "what the check said is kept, as said");
  const open = claimed({ budget: { remaining: 4800 } });
  assert.deepEqual([open.kind, open.basis, open.ambiguous], ["setting", "text", undefined], "with budget left, the claim stands");
  const unknown = claimed({});
  assert.deepEqual([unknown.kind, unknown.basis, unknown.ambiguous], ["other", "text", true], "with no budget reading the claim cannot be told from a limit");
  assert.equal(Object.hasOwn(unknown, "limit"), false);
  // A claim of a missing object is read the same way.
  assert.equal(hosting.classifyPlatformFailure({ text: "Resource not found" }, asked).ambiguous, true);
  assert.equal(hosting.classifyPlatformFailure({ text: "Resource not found", budget: { remaining: 0 } }, asked).kind, "rate-limited");
  // A check's own finding is its verdict, not a platform failure.
  for (const finding of ["Found 2 vulnerable packages: lodash 4.17.20 (high)", "3 tests failed", ""]) assert.equal(hosting.classifyPlatformFailure({ text: finding, budget: { remaining: 0 } }, asked), undefined, finding);
});

it("hosting/T362: a failure holds only its own fields, no header, no token, no key and no address, and the platform's message is its words only, with credentials taken out", () => {
  const token = "ghs_GRANTTOKENVALUE0123456789";
  const dirty = `Bad credentials ${token} and github_pat_11ABCDEFGH0123456789abcd and ghp_abcdefghijklmnopqrstuv, Bearer abc.def-ghi\n-----BEGIN RSA PRIVATE KEY-----\nMIIE\n-----END RSA PRIVATE KEY-----\nsecond line`;
  const f = classify({ status: 401, headers: { authorization: "Bearer zzz", "set-cookie": "s=1", "x-ratelimit-remaining": "9", "x-github-request-id": "ABCD:1" }, body: { message: dirty, documentation_url: "https://docs.github.com/x", errors: [{ token }] } }, { secrets: [token] });
  assert.deepEqual(Object.keys(f).filter((k) => !KEYS.includes(k)), [], "only the declared fields");
  const text = JSON.stringify(f);
  for (const leak of [token, "github_pat_", "ghp_", "Bearer", "PRIVATE KEY", "MIIE", "set-cookie", "authorization", "x-github-request-id", "documentation_url", "https://docs.github.com", "second line"]) assert.equal(text.includes(leak), false, `no ${leak}`);
  assert.match(f.platformMessage, /^Bad credentials \[removed\] and \[removed\] and \[removed\], \[removed\]$/);
  assert.equal(classify({ status: 500, body: { message: "x".repeat(2000) } }).platformMessage.length, 501, "a long message is cut");
  assert.equal(Object.hasOwn(classify({ status: 500, body: { message: "   " } }), "platformMessage"), false, "an empty message is none");
  assert.equal(Object.hasOwn(classify({ status: 500, body: "not an object" }), "platformMessage"), false, "only the message field of the body is read");
  const lim = classify({ status: 429, headers: { "retry-after": "soon", "x-ratelimit-reset": "tomorrow", "x-ratelimit-remaining": "-3" } });
  assert.deepEqual(lim.limit, { bucket: "unknown" }, "a figure that is not a whole number is not kept");
  assert.deepEqual(Object.keys(classify({ status: 429, headers: { "retry-after": "5", "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1800000000", "x-ratelimit-resource": "search" } }).limit).sort(), [...LIMIT_KEYS].sort());
});

it("hosting/T363: every failed adapter call carries the typed failure beside its code, status and headers, and no token appears in it", async () => {
  const APPROVER = { ...DISPATCHER, app: "approver", name: "KAAL Approver", owner: "kaal-review", appId: "5953433", abilities: ["read-contents", "read-pull-requests", "approve-pull-requests"] };
  const WORLD = { declarations: [{ path: "packages/kaal-review/13-source/github-apps/approver.json", declaration: APPROVER }], appId: "5953433", slug: "kaal-approver", installPermissions: { metadata: "read", contents: "read", pull_requests: "write" } };
  const ID = { app: "approver", appId: "5953433" };
  const HEAD = "2".repeat(40);
  const limited = { status: 403, json: { message: "API rate limit exceeded for installation ghs_GRANT" }, headers: { "Retry-After": "30", "x-ratelimit-remaining": "0" } };
  const as = async (abilities, world, call) => {
    const { grant, api } = await granted(abilities, world, WORLD, ID);
    const opts = { grant, fetch: api.fetch, api: api.api };
    return call(opts, api);
  };
  const seen = (e, code, kind) => {
    assert.equal(e.code, code);
    assert.equal(e.failure.kind, kind);
    assert.equal(Object.isFrozen(e.failure), true);
    assert.doesNotMatch(JSON.stringify(e.failure) + e.message, /ghs_/);
    return true;
  };
  await as(["read-contents", "approve-pull-requests"], () => limited, (o) => assert.rejects(hosting.postReview("o/r", 7, { revision: HEAD, event: "APPROVE" }, o), (e) => {
    seen(e, "REVIEW_FAILED", "rate-limited");
    assert.equal(e.status, 403); assert.equal(e.headers["retry-after"], "30", "status and headers are kept as before");
    assert.deepEqual(e.failure.limit, { bucket: "unknown", remaining: 0, retryAfterSeconds: 30 });
    assert.match(e.failure.asked, /pull request 7 in o\/r/);
    assert.equal(e.failure.place, "POST /repos/{repo}/pulls/{number}/reviews");
    return true;
  }));
  await as(["read-contents", "approve-pull-requests"], () => ({ status: 422, json: { message: "Can not approve your own pull request" } }), (o) => assert.rejects(hosting.postReview("o/r", 7, { revision: HEAD, event: "APPROVE" }, o), (e) => seen(e, "REVIEW_FAILED", "other") && e.failure.platformMessage === "Can not approve your own pull request"));
  await as(["read-contents", "approve-pull-requests"], () => { throw new Error("socket closed ghs_GRANT"); }, (o) => assert.rejects(hosting.postReview("o/r", 7, { revision: HEAD, event: "APPROVE" }, o), (e) => seen(e, "REVIEW_FAILED", "network")));
  // The reads keep what they never kept: GitHub's status and headers, and the typed failure.
  await as(["read-contents", "read-pull-requests"], () => limited, (o) => assert.rejects(hosting.listReviews("o/r", 7, o), (e) => seen(e, "READ_FAILED", "rate-limited") && e.status === 403 && e.headers["retry-after"] === "30"));
  await as(["read-contents", "read-pull-requests"], () => ({ status: 404, json: { message: "Not Found" } }), (o) => assert.rejects(hosting.listReviews("o/r", 7, o), (e) => seen(e, "READ_FAILED", "not-found") && e.status === 404));
  await as(["read-contents", "read-pull-requests"], () => { throw new Error("offline"); }, (o) => assert.rejects(hosting.listReviews("o/r", 7, o), (e) => seen(e, "READ_FAILED", "network") && e.status === undefined));
  // An answer of the wrong shape is still a named failure, and is not a platform failure.
  await as(["read-contents", "read-pull-requests"], () => ({ status: 200, json: { not: "a list" } }), (o) => assert.rejects(hosting.listReviews("o/r", 7, o), (e) => e.code === "READ_FAILED" && e.failure === undefined));
});
