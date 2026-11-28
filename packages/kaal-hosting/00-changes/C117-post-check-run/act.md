# C117 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The PLAN's drafts were written and run against a stand-in of GitHub before the PLAN was approved, so the DO was that implementation placed on the collector and the four Cases (T345 to T348) did not move. Only the header comment changed.
- The call is small and closed: one POST, no read before or after, no retry. What the caller may name is a closed list, so a status, an App, a token or `head_sha` cannot be passed at all, and the refusals happen before any request.
- GitHub's answer is never taken as "posted" on a 201 alone. The name, the revision, the status, the conclusion and the App must be the ones asked for, otherwise `CHECK_MISMATCH`. The fixture lets each of those be made wrong by itself, so each is a Case.
- A failure keeps GitHub's `status` and `headers` on the error, so C116's `refusalOf` can tell a refusal from a failure without Hosting choosing a retry policy.

## Learned

- A SYNC pull request is read by a workflow before any person sees it: the title must begin `SYNC:` and the body needs a `## Change` and a `## Reason` chapter (the SYNC template). Mine had neither and the Sync bot skipped or failed it until I fixed both. Read the template before raising a SYNC, not after.
- The CPO's review request for a DO landed on the SYNC, because both were open at once. Raising the SYNC first, and saying in its body that it is not the DO, would have avoided the mix-up.
- After a SYNC lands as a merge commit, the DO branch built on the SYNC's head is `behind` the collector. Merging the collector into the branch (a fast-forward push, no rewrite) fixed it.
- Late CI events can name a head that is no longer the PR's head. Check the PR's own head and check runs before acting on a failure.
- A force push to the dedicated branch is refused, and was not needed: the remote branch had been deleted after the earlier merge, so a plain push created it.

## Lacked

- Evidence of use. Nothing calls `postCheckRun` yet: the Inspector's signing script is Controls' Change, and no check run has been posted to GitHub by this code. The Cases prove the request and the verification against a stand-in, not against GitHub itself.
- A Windows and macOS run on my side: the package tests passed locally only on Linux (Node 22). CI covers the other platforms.

## Longed For

- The Inspector's signing script calling this one function, so that the controls' verdicts are signed under the App's own API budget.
- A single read of a posted run in a test against GitHub, once there is an installation to test with, to confirm the answer's shape that the stand-in assumes.

## Follow-ups

- Controls adopts `postCheckRun` in the Inspector's `sign` script; its own Change. A ruleset that pins a check to the App is Review's and the Owner's.
- `READ_FAILED` keeping its status and headers, as `CHECK_FAILED` now does: its own small Change.
- No WIRE, workflow activation, ruleset, retry policy, enforcement or publication is authorized by this Change.
