// hosting/C116 delivered Cases (T341 to T344): waiting on GitHub. Nothing here reaches GitHub or really waits: the one thing a Case injects is the clock (`sleep`, `now`).
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";

const NOW = 1_800_000_000_000;
const failed = (status, headers = {}, text = "") => Object.assign(new Error(text || `HTTP ${status}`), { status, headers });
// The options a call is given (the two clocks) and, apart from them, what was slept.
const clock = () => { const slept = []; return Object.defineProperty({ sleep: async (s) => { slept.push(s); }, now: () => NOW }, "slept", { value: slept }); };

it("hosting/T341: pollSchedule(n) is the wait before read n + 1, 20 s for the first minute and then 10 s longer each time up to 120 s; it refuses what is not a read number", () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 12, 13, 14, 100].map((n) => hosting.pollSchedule(n)), [20, 20, 20, 30, 40, 50, 110, 120, 120, 120]);
  for (const bad of [0, -1, 1.5, "3", NaN, Infinity, undefined, null]) {
    assert.throws(() => hosting.pollSchedule(bad), (e) => e.code === "INVALID_WAIT", String(bad));
  }
});

it("hosting/T342: refusalOf says a read was refused (rate limit 403, 429, 5xx) and how long GitHub asked to wait, from a status and headers or from the text of a command's failure; a 403 without a rate limit is not a refusal", () => {
  const refused = (failure, expected, why) => assert.deepEqual(hosting.refusalOf(failure, { now: () => NOW }), expected, why);
  for (const status of [429, 500, 502, 503, 504]) refused(failed(status), { refused: true }, `HTTP ${status}`);
  refused(failed(403, { "x-ratelimit-remaining": "0" }), { refused: true }, "403 with the rate limit used up");
  refused(failed(403, { "retry-after": "30" }), { refused: true, wait: 30 }, "403 that says how long to wait");
  refused(failed(403, {}, "API rate limit exceeded for installation 99"), { refused: true }, "403 saying so in words");
  refused(failed(403, {}, "You have exceeded a secondary rate limit"), { refused: true }, "403 secondary limit");
  refused(failed(429, { "retry-after": "7" }), { refused: true, wait: 7 }, "429 with Retry-After");
  refused(failed(403, { "x-ratelimit-remaining": "0", "x-ratelimit-reset": String(NOW / 1000 + 90) }), { refused: true, wait: 90 }, "the reset time is honoured");
  refused(failed(403, { "x-ratelimit-remaining": "0", "x-ratelimit-reset": String(NOW / 1000 - 5) }), { refused: true, wait: 0 }, "a reset that has passed is a wait of none, not a negative");
  refused(failed(429, { "retry-after": "7", "x-ratelimit-reset": String(NOW / 1000 + 90) }), { refused: true, wait: 7 }, "Retry-After wins");
  refused(failed(429, { "retry-after": "soon" }), { refused: true }, "a hint that is not a number is no hint");
  for (const status of [200, 304, 401, 404, 409, 422]) refused(failed(status), { refused: false }, `HTTP ${status}`);
  refused(failed(403, {}, "Resource not accessible by integration"), { refused: false }, "a 403 about permission is not to be retried");
  refused(failed(403, { "x-ratelimit-remaining": "4999" }), { refused: false }, "a 403 with the limit not used up");
  // What a command prints when `gh` is the route.
  for (const [text, expected] of [
    ["gh: API rate limit exceeded for user ID 1 (HTTP 403)", true],
    ["gh: HTTP 502: Bad Gateway (https://api.github.com/x)", true],
    ["HTTP 429: Too Many Requests", true],
    ["gh: Resource not accessible by integration (HTTP 403)", false],
    ["gh: Not Found (HTTP 404)", false],
    ["", false],
  ]) refused(text, { refused: expected }, text);
  refused(Object.assign(new Error("boom"), { stderr: "gh: HTTP 503: Service Unavailable" }), { refused: true }, "an error that carries the command's text");
  for (const nothing of [undefined, null, 42, {}, []]) refused(nothing, { refused: false }, String(nothing));
});

it("hosting/T343: retryWait(attempt, wait?) is the wait before the next attempt, 20 s doubling to 120 s, or the time GitHub asked for, never more than 120 s and never less than 1 s", () => {
  assert.deepEqual([1, 2, 3, 4, 5, 9].map((n) => hosting.retryWait(n)), [20, 40, 80, 120, 120, 120]);
  assert.equal(hosting.retryWait(1, 30), 30);
  assert.equal(hosting.retryWait(3, 7), 7, "what GitHub asked for, not the schedule");
  assert.equal(hosting.retryWait(1, 500), 120, "capped");
  assert.equal(hosting.retryWait(2, 0), 1, "a reset that has passed still waits one second");
  for (const bad of [0, 1.5, "1", undefined]) assert.throws(() => hosting.retryWait(bad), (e) => e.code === "INVALID_WAIT", String(bad));
  assert.throws(() => hosting.retryWait(1, -3), (e) => e.code === "INVALID_WAIT");
  assert.throws(() => hosting.retryWait(1, "9"), (e) => e.code === "INVALID_WAIT");
});

it("hosting/T344: retryRead(read, options) reads again only when the read was refused, waits what GitHub asked or the growing schedule, stops after its attempts, and rethrows any other failure at once and unchanged", async () => {
  // Success: one read, no wait; the read is told which attempt it is.
  const ok = clock();
  const seen = [];
  assert.equal(await hosting.retryRead(async (n) => { seen.push(n); return "value"; }, ok), "value");
  assert.deepEqual([seen, ok.slept], [[1], []]);
  // Refused twice, then read: the growing schedule, no wait after the answer.
  const twice = clock();
  let calls = 0;
  assert.equal(await hosting.retryRead(async () => { if (++calls < 3) throw failed(503); return "late"; }, twice), "late");
  assert.deepEqual([calls, twice.slept], [3, [20, 40]]);
  // GitHub's own time is honoured.
  const asked = clock();
  calls = 0;
  await hosting.retryRead(async () => { if (++calls === 1) throw failed(429, { "retry-after": "7" }); return 1; }, asked);
  assert.deepEqual(asked.slept, [7]);
  const reset = clock();
  calls = 0;
  await hosting.retryRead(async () => { if (++calls === 1) throw failed(403, { "x-ratelimit-remaining": "0", "x-ratelimit-reset": String(NOW / 1000 + 45) }); return 1; }, reset);
  assert.deepEqual(reset.slept, [45]);
  // Any other failure is the caller's, at once, the very same object.
  const denied = clock();
  const permission = failed(403, {}, "Resource not accessible by integration");
  calls = 0;
  await assert.rejects(hosting.retryRead(async () => { calls += 1; throw permission; }, denied), (e) => e === permission);
  assert.deepEqual([calls, denied.slept], [1, []]);
  // Refused every time: five attempts by default, four waits (none after the last), a named failure with the count.
  const always = clock();
  calls = 0;
  await assert.rejects(hosting.retryRead(async () => { calls += 1; throw failed(502); }, always), (e) => e.code === "READ_REFUSED" && e.attempts === 5 && /5/.test(e.message));
  assert.deepEqual([calls, always.slept], [5, [20, 40, 80, 120]]);
  // `attempts` is the one option that changes it, bounded.
  const one = clock();
  calls = 0;
  await assert.rejects(hosting.retryRead(async () => { calls += 1; throw failed(500); }, { ...one, attempts: 1 }), (e) => e.code === "READ_REFUSED" && e.attempts === 1);
  assert.deepEqual([calls, one.slept], [1, []]);
  // Refused before any read: a read that is not a function, an attempts outside 1..10, an unknown option.
  for (const [why, read, options] of [
    ["no read", undefined, ok], ["attempts 0", async () => 1, { ...ok, attempts: 0 }], ["attempts 11", async () => 1, { ...ok, attempts: 11 }], ["attempts 2.5", async () => 1, { ...ok, attempts: 2.5 }],
    ["attempts as text", async () => 1, { ...ok, attempts: "3" }], ["a token option", async () => 1, { ...ok, token: "ghs_X" }], ["a wait option", async () => 1, { ...ok, wait: 0 }],
  ]) {
    let touched = 0;
    await assert.rejects(hosting.retryRead(read && (async () => { touched += 1; return 1; }), options), (e) => e.code === "INVALID_WAIT", why);
    assert.equal(touched, 0, `${why}: refused before any read`);
  }
});
