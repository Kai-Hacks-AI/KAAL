# hosting/C117 change

## From

A script that signs a control's verdict as a check of the Inspector builds the POST itself: the route, the headers, the body, and the reading of the answer. What the body may hold (the status, the App, the permissions) and what GitHub's answer must say before the run counts as posted are rules about GitHub and about the App's authority, which Hosting holds once.

## To

One call, `postCheckRun(repo, check, { grant, fetch?, api?, now? })`, under a grant that holds `post-checks`.

1. **What the caller names.** `check` is `{ name, revision, conclusion, title, summary, externalId? }` and nothing else: no status, App, id, `head_sha`, `output`, token or permission (any other key is `INVALID_CHECK`). Options are `grant`, `fetch`, `api` and `now`, as for the reads; a `token`, `abilities` or any other option is `INVALID_CHECK`.
2. **What Hosting sends.** One `POST /repos/{repo}/check-runs` with the grant's token and exactly `{ name, head_sha: revision, status: "completed", conclusion, output: { title, summary }, external_id? }`. A run is posted complete, in one request: no read before it, no read after it, no update, and no retry. `external_id` is sent only when the caller gave one, so a reader can tell two posts of one verdict apart.
3. **What it refuses before any call.** A missing, forged or foreign grant (`GRANT_UNTRUSTED`), another repository (`GRANT_REPO_MISMATCH`), a grant without `post-checks` (`ABILITY_REFUSED`); a check GitHub would not take or that is not what it says (`INVALID_CHECK`): a name that is empty, not text or has a line break (at most 255 characters), a revision that is not a full lower-case commit id, a conclusion outside `success`, `failure`, `neutral`, `cancelled`, `skipped`, `timed_out`, `action_required`, a title or summary that is empty (title at most 255, summary at most 65535 characters), an empty or over-long external id.
4. **What it verifies.** GitHub's answer must be a 201 that holds a numeric `id`, the name, the revision, `status: completed` and the conclusion asked for, made by the App whose grant posted it (its id and slug against `grantIdentity`). Anything else is `CHECK_MISMATCH`: a run that is not the one asked for is not reported as posted.
5. **What it returns.** `{ id, name, revision, conclusion, signer, externalId? }`, frozen and attributed (`factOrigin` names the App and the repository; a copy gives `null`). `signer` is the App's slug, the same word `readPullRequestFacts` gives for a run.
6. **What a failure keeps.** Any answer but 201, or a request that did not complete, is `CHECK_FAILED` and keeps GitHub's `status` and its `headers` (names in lower case) on the error, so that `refusalOf` of hosting/C116 tells a refusal from a failure. `AppAdapterError` gains the two optional fields. No message, status line or header holds a token.

## Because

The Inspector's token has its own installation budget, which is the fix: the controls' signing script calls one Hosting function and Hosting alone knows what a check run needs, what GitHub must answer, and how to say a refusal. Nothing here decides whether a check passes or whether it is required: that is Review's and Controls'.

## FAR (because of Features we have to Accept Regression)

1. Regression: Hosting's Cases T1 to T340 stay GREEN (T341 to T344 once C116 is delivered). Nothing existing changes; `AppAdapterError`'s new fields are absent unless a call sets them.
2. Accept list: none. The App fixtures' stand-in gains one optional field, `headers`, on an answer, which no earlier Case sets.
3. Feature Cases, RED today. Executable drafts in this folder (`post-check.red.mjs`; they run on a checkout of the C114 collector, where they pass against an implementation); the DO turns them into delivered Cases **unchanged**.
   - hosting/T345: one POST of the fixed form with the grant's token (no read, no retry); the run returned as a frozen fact attributed to the App; no external id means none sent and none returned.
   - hosting/T346: a missing, forged, foreign, read-only grant, another repository, any authority key in the check and any other option are refused before any call.
   - hosting/T347: each invalid name, revision, conclusion, title, summary and external id is refused before any call; the seven conclusions and the edge lengths are posted.
   - hosting/T348: a 403 with its headers, a 429, a 422, a 500 and a network error are `CHECK_FAILED` with the status and headers kept, one request each, no token in the error; a run GitHub made with another name, revision, conclusion, status or App, or with no numeric id, is `CHECK_MISMATCH`.

## Not in this Change

Any DO. Updating or listing check runs; annotations, images or actions; a retry (a caller decides, with `retryRead` of C116 or not, because a repeated POST can make a second run); the Inspector's workflow or its `sign` script (Controls); the Inspector's declaration and its `appId` (Review); a ruleset that pins a check to the App; a key, a secret or a variable. `READ_FAILED` of the reads keeping its status and headers: its own small Change.

## DO

Not authorized by this PLAN. On the merged PLAN and with C114 on `main`: `scripts/github/app-checks.ts`, the two fields of `AppAdapterError`, the export, T345 to T348 as delivered Cases, the fixture's `headers`, the ids in `04-test/package-check/testing.md`, the element texts (F112, A49), the README and operations entries.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
