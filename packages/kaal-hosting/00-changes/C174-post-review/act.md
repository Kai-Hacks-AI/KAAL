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

## The App standard: what is on main and what is missing

The Approver, the Inspector and the Dispatcher are meant to sit on one standard owned by Hosting. Review and Release own their judgments and policies; Hosting owns the platform operations. State at the end of C174:

- **On main:** the closed ability list and the refusal of abilities that could write contents, workflows, admin or secrets (hosting/F98); the grant and its identity (hosting/A44); the attributed fact (hosting/A47); the reads (hosting/A45); and `postCheckRun` (C117).
- **In the promotion queue or on a collector:** the contract fix of `postCheckRun` (C169), the run facts (C118) and `postReview` (C174).
- **Missing, abilities:** the Dispatcher's ability to enable auto-merge on pull requests it raised. Whether GitHub needs contents write for it is not documented and needs a probe; widening is the Owner's decision. Its own Hosting PLAN follows the probe.
- **Missing, authority:** Hosting refuses the classes of ability no App may hold, but nothing states which App may hold which of the allowed abilities (the Approver only approves, the Inspector only posts checks, the Dispatcher only raises and enqueues). Each declaration states it, owned by Review and Release, and Hosting does not compare a declaration with a role. A standard table of the abilities each of the three Apps may hold, checked when a declaration is read, is a Hosting Change for the Owner to accept.
- **Missing, budgets:** the Apps share the installation's API budget, and no operation accounts for it. Reads wait and retry (C116), but writes do not, `READ_FAILED` does not keep the status and headers, and a rate-limit answer is not logged anywhere. The CodeQL upload of this very pull request failed on that budget. A rate-limit record and a per-App budget are a Hosting Change; polling stays owned by Hosting.
- **Missing, evidence:** every operation is proven against the stand-in only. A first real check run, review and enqueue under each installation would show whether the stand-in matches GitHub. Installing the Apps and their keys is the Owner's decision.
- **Missing, entry:** no command wraps `postCheckRun` or `postReview`; a workflow builds the package from the default branch and imports it. A command is its own Hosting Change if Release asks for it.
- **Not Hosting's:** the declarations of the Approver and the Inspector are on no branch of Hosting; Review delivers them with its own Changes, and Hosting only reads them.
