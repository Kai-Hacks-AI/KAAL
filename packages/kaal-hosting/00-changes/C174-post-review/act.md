# C174 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The Change copied C117's shape (one POST under a grant, GitHub's answer verified, an attributed fact) and the two contract corrections of C169 from the start: every key outside the review is refused whatever its value, symbols included, and nothing is reported that GitHub did not return. The CPO's two findings on `postCheckRun` did not recur here.
- Review and Release answered the open points while the PLAN was written: the Approver approves only SYNC pull requests that pass `verify Sync`, `postReview` takes the review event, and the two Apps stay separate. The PLAN left the decision to approve with Review and the workflow with Release, and Hosting kept to mechanics.
- Naming the commit is the point of the call: GitHub attaches an approval without `commit_id` to whatever the head is when the request arrives. The Cases prove the commit is in the request, and that an answer for another commit is `REVIEW_MISMATCH`.
- The drafts ran against a throwaway implementation before the PLAN was approved, so the DO was that implementation placed on the collector and no Case moved. A mutation (dropping the commit comparison) failed T359, so the Cases can fail.

## Learned

- A mutation that changes a key check to compare the string of a symbol is not a mutant: a symbol named like an allowed key cannot be built to tell them apart. Test symbol keys with a symbol that is not any listed name, and rely on the type check.
- The Approver's declaration cannot list an ability the App's fixture does not hold: the stand-in refuses to mint it (`APP_TOKEN_REFUSED`). A Case for a "grant without the ability" can only use abilities the declaration lists, so the second ability of that Case is `read-contents` alone.
- A fetch of two refs fails as a whole when one is missing: fetch the collector alone before building on it, and expect the dedicated branch to be gone after each merge, so that the next push creates it.
- GitHub's documentation does not say which permissions enabling auto-merge needs. A fact about the platform that decides an Owner question (widening the Dispatcher to contents write) needs a probe with the real installation, not a reading.

## Lacked

- Evidence against GitHub itself: all four Cases run against the stand-in, and what GitHub answers to a review posted by an App (status 200 and the reviewer's login with `[bot]`) is read from its documentation, not observed.
- The Approver's declaration file and its `appId` are not on `main` yet (Review, with its C8 DO), and the key is not installed (the Owner); the call cannot be used before both exist.

## Longed For

- A first real approval of a `SYNC:` pull request under the Approver's installation, so that the shape of GitHub's answer is observed once and the stand-in can be checked against it.
- The Dispatcher's enqueue ability, once the probe says what GitHub needs for it.

## Follow-ups

- Release's C173 adopts `postReview` in the Sync replacement; Review's C8 DO delivers `approver.json`. Each is its own Change.
- The Dispatcher's enqueue ability is a separate Hosting Change after the probe; widening the Dispatcher to contents write, if needed, is the Owner's decision.
- No WIRE, key, installation, workflow activation, ruleset or publication is authorized by this Change.
