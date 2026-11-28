# C210 change

## From

Each caller that makes a platform call, or reads a check's outcome, builds its own idea of what failed: from a status, from headers, from text, or from nothing. The same API limit shows as a refusal in one place, a lost connection in another, and "Dependency graph is not enabled" in a third. Hosting's own adapters keep the status and headers of a failed write and nothing of a failed read, so a caller cannot even do the classification itself for them.

## To

One type, one function, carried by every Hosting error that wraps a platform call.

1. **The type.** `PlatformFailure = { kind, basis, asked, place, status?, platformMessage?, ambiguous?, limit? }`, frozen, with these and no other fields.
   - `kind` is one of `rate-limited`, `forbidden`, `not-found`, `network`, `setting`, `other`. The list is closed: a kind is added by a Change, never by a caller.
   - `basis` is what the kind rests on: `answer` (the status and headers of an API answer), `text` (a pattern in the platform's own words) or `budget` (an exhausted budget seen when the call was made, which outweighs a text that claims another cause).
   - `asked` and `place` are the caller's words: what was read or done, as a short phrase naming its target, and the endpoint or job it went to.
   - `status` is GitHub's status when there was one. `platformMessage` is GitHub's own `message` as it said it, one line, at most 500 characters, with every credential shape and every known token taken out. It is never Hosting's text.
   - `ambiguous: true` is set only with `kind: "other"`: the text claimed a cause (a setting, a missing object) that a limit could also produce, and nothing here tells which. A caller says so in plain words and does not present it as a setting problem.
   - `limit` is set only with `kind: "rate-limited"`: `{ bucket, remaining?, resetAt?, retryAfterSeconds? }`, read from `x-ratelimit-resource`, `x-ratelimit-remaining`, `x-ratelimit-reset` (given as an ISO time) and `retry-after`. A figure that is not a whole number is not kept, and what the headers did not say is not invented (`bucket` is `unknown`).
2. **What it never holds.** No request or response header (only the limit figures read from them), no token, no key, no address, no other field of GitHub's body than `message`.
3. **The function.** `classifyPlatformFailure(answer, { asked, place, secrets? })` takes `answer = { status?, headers?, body?, error?, text?, budget? }` and returns a `PlatformFailure`, or nothing when the answer shows no platform failure (a success, or a check's own finding: that is the check's verdict, not the platform's failure). It throws `TypeError` when `asked` or `place` is missing or not text. It is pure: it reads no environment, no file and no clock.
   - A status of 429, or 403 with `retry-after` or no requests left, is `rate-limited` on the `answer`. A 403 or 429 whose message says it was a (secondary) rate limit is `rate-limited` on the `text`. Any other 401 or 403 is `forbidden`, a 404 is `not-found`, any other failing status is `other`. No status and a thrown error is `network`.
   - With no usable status, the text of a check is read: a rate-limit text is `rate-limited` on the `text`. A text that claims a setting or a missing object is told apart by the budget the caller saw: exhausted gives `rate-limited` on the `budget` (the claim stays in `platformMessage`), budget left gives `setting` or `not-found` on the `text`, and no reading gives `other` with `ambiguous: true`. A text that claims none of these (a finding) gives nothing.
4. **Carried by every adapter error.** `AppAdapterError` gains an optional `failure`, set by every call that wraps a platform call: `READ_FAILED`, `CHECK_FAILED`, `REVIEW_FAILED` and `APP_TOKEN_FAILED`, also for a lost connection. The reads now keep GitHub's `status` and `headers` as the writes already do (the `READ_FAILED` backlog item folds in here). An answer of the wrong shape under a 200 is still named, and has no `failure`: it is not a platform failure.
5. **For callers outside the adapters.** `classifyPlatformFailure` and the type are exported from the package, so a check that reads with the workflow token (Controls' fact sources, Release's checks, Engineering's audit) hands over what it saw and carries the result unchanged.

## Because

Kai's rule: when we rely on a third party, we must tell the real cause of a failure, so that the message to an agent or a human is clean. One classification in one place means a rate limit is never reported as a setting, a missing grant or a missing object, and a verdict (Controls) can say UNKNOWN with the true cause instead of a guess. It also is the first of the supplier expectations of Controls' measured reporting (controls/C180): the failure facts. The API counter and budget are the next Hosting Change, not this one.

## FAR (because of Features we have to Accept Regression)

1. Regression: Hosting's Cases T1 to T359 stay GREEN (T341 to T359 once their collectors are on `main`). `AppAdapterError` gains an optional field and the reads add `status` and `headers` to their errors: every existing error keeps its code and message, so no existing Case moves.
2. Accept list: none.
3. Feature Cases, RED today. Executable drafts in this folder (`platform-failure.red.mjs`; they run on a checkout of `main` with the C114 fixtures and the C174 collector, where they pass against an implementation); the DO turns them into delivered Cases **unchanged**.
   - hosting/T360: an API answer is classified by its status and headers into the six kinds; 429, 403 with and without limit signals, 401, 404, the other failing statuses, a lost connection, a success and an empty answer; the context is refused when it is missing.
   - hosting/T361: the text of a check that is not an API answer: a rate-limit text, today's Dependency Review text with an exhausted budget (`rate-limited` on the `budget`, the claim kept), with budget left (`setting`), and with no reading (`other`, ambiguous); a missing-object claim the same way; a check's finding gives nothing.
   - hosting/T362: only the declared fields; no header, token, key or address in a failure; credential shapes, a known token and a private key taken out of the message; a long message cut; a figure that is not a whole number is not kept; the limit holds only its four fields.
   - hosting/T363: a failed `postReview`, and a failed read of reviews, carry the failure beside their code, status and headers: a limit, a refusal to approve one's own pull request, a lost connection, a 404; no token in it; a wrong shape under a 200 has none.

## Not in this Change

Any DO. What a kind means for a verdict, the guidance line per kind and the carrying into a verdict (Controls, C179 and its DO, which is provisional until this PLAN is merged); retiring Release's interim raw diagnostics in `promotion-source` (release/C200) and the workflow-token reads that print their own error: each consumer adopts `classifyPlatformFailure` in a Change of its own, and Hosting only supplies it; the API call counter, the budget seen and the measures for Controls' reporting (a separate Hosting Change, which starts by establishing the real rate-limit boundaries); retries, waiting and polling (hosting/C116 and the budget Change); which abilities an App may hold (the authority Change); the Dependency Review setting itself. No WIRE, key, installation, ruleset or publication is authorized by this Change.

## DO

Not authorized by this PLAN. On the merged PLAN: `scripts/github/platform-failure.ts`, `failure` on `AppAdapterError`, the failure on the reads, the writes and the token calls, the export, T360 to T363 as delivered Cases, the ids in `04-test/package-check/testing.md`, the element texts (F115, A52), the README and operations entries.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
