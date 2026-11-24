# C33 change

The Owner asked (24 Nov) whether the Inspector or "checking out both branches" handles a pull request that edits its own judge, and then said go. The Inspector's judge-from-base slice is not built (controls C14, only the registry is on main), so this is the interim fix inside the jobs. The same fix is what the Inspector does later, so nothing here is thrown away.

## The answer in six lines

1. **Judge from the default branch.** Each gate job's one `actions/checkout` uses `ref: ${{ github.event.repository.default_branch }}`, so the judge (`engineering/release-management/05-src/codeql-gate/`) and `judge-mode` are the reviewed ones on `main`, whatever the pull request edits.
2. **Only the pull request's data.** The judges do not read the pull request's files. They read the code-scanning analyses and alerts of `GITHUB_SHA` and `GITHUB_REF` from the API, so the merge result is not checked out at all. The job environment does not set `GITHUB_SHA` or `GITHUB_REF`; they stay the event's, which is how the judge asks about the merge-result sha.
3. **One rule for every trigger.** `pull_request`, `merge_group`, `push` and `schedule` all take the judge from the default branch. The alternative, the base of each event (`pull_request.base.sha`, `merge_group.base_sha`, `before`), needs a rule per trigger, and `before` is empty on a first push.
4. **A consequence, stated.** A pull request that changes the judge is itself judged by the old judge on `main`; the new judge applies once it is on `main`. This is the point: the code that decides is only code that was reviewed in.
5. **Not closed by this Change.** The workflow file is also edited by a pull request (a `pull_request` run uses the merge result's workflow), so a pull request could change the gate jobs themselves. That is the residual the other Actions gates share (release C90: "the Inspector's signed check replaces it later"); here `.github` travels alone and reaches `main` only by a WIRE with the Owner's go. Closing it for good is the Inspector's slice, not this Change.
6. **Order.** The source is on `kaal/engineering/codeql-gate` until its promotion, so the DO of this Change waits for that promotion and is cut from `main` after it.

## What this Change pins (Cases, plain `.test.mjs`)

- T1413: in the source, each gate job has exactly one `actions/checkout`, with `ref: ${{ github.event.repository.default_branch }}` and `persist-credentials: false`, and no step of the job checks out the pull request's head or merge result.
- T1414: no gate job sets `GITHUB_SHA` or `GITHUB_REF` in its environment, so the judge still asks about the event's own sha and ref.

Both read the source on the branch, which the collector of this PLAN does not hold until C32 is promoted, so both are RED here for that reason. Against C32's source as it is, T1413 is RED (no default-branch checkout) and goes GREEN with the checkout line added, and RED again if the line names the pull request's head. T1414 is GREEN against C32's source as it is: it is a guard that the fix does not break the judge's sha and ref, not a driver of the fix.

## Questions for the CPO

1. **Default branch or each event's base?** Recommended: the default branch, for one rule over all four triggers (point 3). Cost: a pull request into a collector is judged by `main`'s judge, which is the reviewed one.
2. **The residual in point 5.** Recommended: accept it for this Change and name the Inspector slice as its closer, so it is a known gap with an owner and not a surprise.

## Not in this Change

No WIRE, no `.github` change, no ruleset change, no change to the judges, the thresholds or the job names.
