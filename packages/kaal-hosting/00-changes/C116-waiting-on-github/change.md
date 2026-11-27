# hosting/C116 change

## From

Every KAAL script that waits on GitHub (the merge-group review of C164 is the first) writes its own schedule, its own test for "GitHub refused this read" and its own retry loop. The tests differ: C164's treats every 403 as a refusal, including the 403 that says a token lacks a permission, which waiting cannot cure. What counts as a refusal and how long to wait are facts about GitHub, which Hosting exists to hold once.

## To

Hosting exports four small functions, with no secret, no account and no network of their own. Each is usable from a script that reaches GitHub by `gh`, by `fetch` or by Hosting's own reads.

1. **`pollSchedule(n)`**: the wait in seconds before read `n + 1` of a poll: 20 s for the first three reads, then 10 s longer each time up to 120 s. It is C164's `schedule`, moved as it is. `n` must be a positive integer, otherwise `INVALID_WAIT`.
2. **`refusalOf(failure, { now? })`**: `{ refused: boolean, wait?: number }`. A failure is a status with headers (an error from `fetch` or from Hosting's reads), the text a command printed (`gh`'s stderr), or an error holding either. It is refused when the status is 429 or 5xx, or 403 together with a sign of the rate limit: `x-ratelimit-remaining: 0`, a `retry-after`, or the words "rate limit". A 403 about a permission, any 4xx else and anything that is not a failure are not refused, so no retry waits for something that waiting cannot cure. `wait` is what GitHub asked for in seconds: `retry-after` first, otherwise the reset time less the clock (0 when it has passed); a hint that is not a number is no hint.
3. **`retryWait(attempt, wait?)`**: the wait before the next attempt: 20 s doubling to 120 s by attempt, or the time GitHub asked for; at most 120 s and at least 1 s. Invalid arguments are `INVALID_WAIT`.
4. **`retryRead(read, { attempts?, sleep?, now? })`**: calls `read(attempt)`, and when it throws a refusal waits `retryWait` and calls again, up to `attempts` (default 5, an integer from 1 to 10), with no wait after the last. A failure that is not a refusal is rethrown at once and unchanged. The last refusal is `READ_REFUSED` naming the attempts. The caller supplies the read, so what it reads and with which authority is its own: this function holds no grant and never reads. `sleep` and `now` are the only injectable things (a Case injects the clock and nothing else); any other option, a `token` among them, is `INVALID_WAIT` before any read.

The judgment of what the poll is waiting for (`groupState`, the budget a group may take) stays with Release. Hosting decides only what a refusal is and how long to wait.

## Because

C164 and every later waiter share one meaning of "refused" and one schedule, owned where GitHub's behaviour is owned. Release's copy becomes a call to Hosting's, in a Change of Release's own after this one is on `main`; until then the two coexist and C164 is not touched. Controls exposes the four functions to its consumers.

## FAR (because of Features we have to Accept Regression)

1. Regression: Hosting's Cases T1 to T335 stay GREEN. Nothing existing changes.
2. Accept list: none.
3. Feature Cases, RED on `main` today. Executable drafts in this folder (`waiting.red.mjs`; they pass against a stand-in of the four functions); the DO turns them into delivered Cases **unchanged**.
   - hosting/T341: `pollSchedule` gives 20, 20, 20, 30, 40, 50, 110, 120, 120, 120 for reads 1, 2, 3, 4, 5, 6, 12, 13, 14, 100, and refuses a number that is not a positive integer.
   - hosting/T342: `refusalOf` is refused for 429 and 500, 502, 503, 504, for a 403 that has used the limit up, holds `retry-after` or says "rate limit" (also the secondary limit), and for the same said in a command's text; it is not refused for a 403 about permission, a 403 with the limit not used up, or any 2xx, 304, 401, 404, 409 or 422, nor for nothing; `wait` is `retry-after`, else the reset time less the clock, 0 when passed, none when no hint is a number.
   - hosting/T343: `retryWait` gives 20, 40, 80, 120, 120, 120, honours what GitHub asked for, caps at 120, floors at 1, and refuses a bad attempt or a hint that is negative or not a number.
   - hosting/T344: `retryRead` returns a success without waiting; waits 20 and 40 for two refusals; waits what GitHub asked; rethrows any other failure at once, the same object; after five refusals has made five reads and four waits and fails `READ_REFUSED` naming five; accepts `attempts` from 1 to 10 and refuses everything else (no read, attempts outside the range or not a number, an unknown option) before any read.

## Not in this Change

Any DO. The rate-limit log (reading `/rate_limit` through a grant, and the line before and after a job): its own Change after C114 is on `main`. Moving or changing Release's C164 script or its Cases; a poll loop; a budget; what a group of checks is waiting for; a WIRE or a workflow.

## DO

Not authorized by this PLAN. On the merged PLAN: the four functions in one module, their exports, T341 to T344 as delivered Cases, the ids in `04-test/package-check/testing.md`, the element texts (I24, F108 to F111, A48), the README and operations entries.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
