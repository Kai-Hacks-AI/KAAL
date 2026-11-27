# C118 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The Owner's boundary, stated three times by the CPO (Hosting provides facts and someone else checks; content identity comes before Git identity; an unreadable repository is an error, never an absent one), made the Change smaller and more exact each time. The final shape has no field called judged, no verdict and no relation called enough, and each relation is `null` when its input was not given.
- The identity is defined in one sentence and written out a second time, independently, in the Case (T352, T353). A change to the order, a path or a byte is caught by a Case that does not use Hosting's own code to compute the expectation.
- The drafts ran against a throwaway implementation before the PLAN was approved, so the DO was that implementation placed on the collector and the Cases did not move. Mutating the identity's order and a relation confirmed the Cases can fail.
- Testing's C84 moved to an opaque identity while this PLAN was open, and the two ended with one clean boundary: the consumer connects Hosting's `digest` to Testing's check, and neither names the other's fields.

## Learned

- A first design that named one revision "judged" was the wrong shape for Hosting. When a capability is asked to resolve something, ask first who decides what it means; Hosting states, the consumer says what it examined, Testing checks.
- A commit id is a name, not content. A merge commit that has the head as a parent, and a changed file at the head commit, are the two cases that show it, and both are Cases.
- The first DO conflated "no Git here" with "Git I cannot read". A fallback that returns `null` on an error is a guess. The distinction now rests on whether `.git` exists, and Git must answer once it does.
- A new command needs a row in the interface contract of the planned outer test (`00-changes/interface/architecture.md`) as well as in the Architecture table, or both CI platforms fail with `undeclared bin`. The earlier commands did this in their DOs; it is easy to miss because the local interface test passed only after the row was there.
- Late CI events can name a head that is no longer the PR's head. Read the check runs of the PR before acting on a failure.
- Only one PR can use the dedicated branch. Closing a held DO and raising an amendment on the same branch needs a fast-forward: a commit whose tree is the collector's plus the amendment, on top of the closed DO's history, avoids a force push and leaves the PR's diff as the amendment alone.

## Lacked

- A decision, before the first PLAN, of where the examined scope comes from. Whole working copy only is a stated limitation; a narrower scope (`under`) is a later Change and the consumer's to ask for.
- Fetching a missing head commit. A shallow checkout gives `headContent: null`; a consumer that needs it fetches it, and Hosting does not (no network).
- Evidence of use. Nothing calls the command yet: Release's records and Controls' ratchet are other capabilities' Changes.

## Longed For

- Release's three records reading these facts and passing the content identity to Testing's check, so that `GITHUB_SHA` is not read at any evidence boundary.
- A Controls ratchet that forbids `GITHUB_SHA` at a record boundary, with this command as the permitted source.
- A line-ending policy for checkouts on Windows, so that `contentIsHeadContent` is not false for a correct checkout (stated in the PLAN as a residual risk).

## Follow-ups

- Consumers (Release, Controls) adopt `kaal-hosting-run-facts` or `describeRun`; each is its own Change. No ratchet, WIRE or publication is authorized by this Change.
- A narrower content scope (`under`) when a consumer needs one.
- The retrospective of C117 and its DO wait for C114 on `main`.
