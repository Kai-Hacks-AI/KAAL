# C174 change

## From

The Approver's workflow builds the POST of a review itself: the route, the headers, the body and the reading of the answer. What a review may hold (the event, the commit it is bound to), who must be its author, and what GitHub's answer must say before the approval counts as posted are rules about GitHub and about the App's authority, which Hosting holds once. Without the commit named, GitHub attaches the approval to whatever the head is when the request arrives, so an approval can land on a push the verdict never saw.

## To

One call, `postReview(repo, number, review, { grant, fetch?, api?, now? })`, under a grant that holds `approve-pull-requests`.

1. **What the caller names.** `review` is `{ revision, event, body? }` and nothing else: no state, App, id, `commit_id`, comments, token or permission (any other key, whatever its value, a symbol key included, is `INVALID_REVIEW`). `event` is `APPROVE` and nothing else: the Approver only approves, and a request for changes or a comment is another ability if it is ever needed. Options are `grant`, `fetch`, `api` and `now`, as for the other calls; any other option key is `INVALID_REVIEW`.
2. **What Hosting sends.** One `POST /repos/{repo}/pulls/{number}/reviews` with the grant's token and exactly `{ commit_id: revision, event: "APPROVE", body? }`. The approval is bound to the commit the caller names, in one request: no read before it, no read after it, no update, no dismissal and no retry. `body` is sent only when the caller gave one.
3. **What it refuses before any call.** A missing, forged or foreign grant (`GRANT_UNTRUSTED`), another repository (`GRANT_REPO_MISMATCH`), a grant without `approve-pull-requests` (`ABILITY_REFUSED`); a review GitHub would not take or that is not what it says (`INVALID_REVIEW`): a pull request number that is not a positive whole number, a revision that is not a full lower-case commit id, an event other than `APPROVE`, a note that is empty, not text or over 65535 characters.
4. **What it verifies.** GitHub's answer must be a 200 that holds a numeric `id`, `state: APPROVED`, the `commit_id` asked for and a reviewer that is the App whose grant posted it (its bot login against `grantIdentity`, of type `Bot`). Anything else is `REVIEW_MISMATCH`: an approval that is not the one asked for is never reported as posted. A GitHub that answers 201, or any other success, is a failure by the next point, not an approval.
5. **What it returns.** `{ id, number, revision, state: "APPROVED", reviewer: { login, type } }`, frozen and attributed (`factOrigin` names the App and the repository; a copy gives `null`).
6. **What a failure keeps.** Any answer but 200, or a request that did not complete, is `REVIEW_FAILED` and keeps GitHub's `status` and its `headers` (names in lower case) on the error, so that `refusalOf` of hosting/C116 tells a refusal from a failure. GitHub's own refusal to let an App approve a pull request it authored is such a failure (422): Hosting does not check authorship before the call, because Review's rule does (review/F40). No message, status line or header holds a token.

## Because

The Approver's token has its own installation budget and the permissions of one job, which is the fix for the shared token. The Approver's workflow calls one Hosting function and Hosting alone knows what a review needs, what GitHub must answer, and how to say a refusal. Nothing here decides whether a pull request is approved: that is Review's and Release's, and an `abstain` posts nothing.

## FAR (because of Features we have to Accept Regression)

1. Regression: Hosting's Cases T1 to T355 stay GREEN (T341 to T355 once their collectors are on `main`). Nothing existing changes; `AppAdapterError` gains three codes, absent unless a call sets them.
2. Accept list: none.
3. Feature Cases, RED today. Executable drafts in this folder (`post-review.red.mjs`; they run on a checkout of `main` with the C114 fixtures, where they pass against an implementation); the DO turns them into delivered Cases **unchanged**.
   - hosting/T356: one POST of the fixed form at the named commit with the grant's token (no read, no retry); the approval returned as a frozen fact attributed to the App; no note means none sent.
   - hosting/T357: a missing, forged, foreign, read-only or contents-only grant, another repository, any key outside the review whatever its value (symbols included) and any other option are refused before any call.
   - hosting/T358: each invalid number, revision, event and note is refused before any call; the longest note is posted.
   - hosting/T359: a 403 with its headers, a 422, a 429, a 500, a network error and a 201 are `REVIEW_FAILED` with the status and headers kept, one request each, no token in the error; an answer with another commit, a state other than APPROVED, another reviewer, a reviewer that is a person, or no numeric id is `REVIEW_MISMATCH`.

## Not in this Change

Any DO. Approving anything but by the one event; dismissing, updating or listing reviews (listing exists); commenting; the decision to approve (Review's `approve` or `abstain`); the Approver's workflow and its trigger (Release, C173); the Approver's declaration file `approver.json` and its `appId` (Review and the Owner); the key, the secret and the variable (`KAAL_APP_APPROVER_KEY`, `KAAL_APP_APPROVER_ID`; the Owner); a ruleset; any WIRE. Enabling auto-merge for the Dispatcher is its own Change.

## DO

Not authorized by this PLAN. On the merged PLAN: `scripts/github/app-reviews.ts`, the three error codes, the export, T356 to T359 as delivered Cases, the ids in `04-test/package-check/testing.md`, the element texts (F114, A51), the README and operations entries.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
