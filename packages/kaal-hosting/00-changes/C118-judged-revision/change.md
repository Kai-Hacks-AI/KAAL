# hosting/C118 change

## From

Each caller that records evidence decides for itself where the revision comes from, and the variable that is closest (`GITHUB_SHA`) is the revision of the trigger, not of what was judged. A caller that passes the trigger as the judged revision makes Testing's check say ok, because the two names agree (C84's residual risk). What a run judges is a fact about GitHub's events, and the working copy that was examined is a fact about the host; both are Hosting's to state once.

## To

One pure function and one command.

1. **`judgedRevision(source, checkout?)`.** `source` is `{ eventName, event, trigger? }`: the name of the event, its payload, and the revision of the trigger (`GITHUB_SHA`) when the caller has it. The judged revision is read from the event and from nowhere else: `pull_request` and `pull_request_target` at `event.pull_request.head.sha`; `push` at `event.after`; `merge_group` at `event.merge_group.head_sha`. Any other event is `UNSUPPORTED_EVENT` (a `workflow_run`, a `schedule` or a `workflow_dispatch` has no judged revision of its own; a later Change may add one). A field of another event in the payload is never read.
2. **The answer.** A frozen `{ judged, trigger, event, source, checkout }`: `judged` the full commit id in lower case (40 or 64 hexadecimal characters, the same revision as Testing's check; an abbreviation, a missing id and the id of a deleted ref, all zeros, are `NOT_A_REVISION`), `trigger` the given revision or `null` (never invented), `source` where in the event it was read, and `checkout` how the working copy relates to it. `judged` and `trigger` are exactly the inputs of `checkRevision` of C84.
3. **The run agrees with its event.** On `push` and `merge_group` the trigger is the judged commit; a trigger that differs is `UNTIED`. On `pull_request` the trigger is the test merge commit and is not compared.
4. **The checkout.** With a `checkout` (`{ commit, parents }`, what `readCheckout(root)` returns) the answer says `judged` when the checkout is the judged commit, and `merge-of-judged` when, on a `pull_request`, it is a commit whose parents include the judged commit (the test merge commit the checkout action fetches by default). Any other checkout is `UNTIED`: it is not what was judged. Without a checkout the answer says `checkout: null`, not tied; a caller that records evidence passes the checkout. On `pull_request_target` the default checkout is the base, so a caller that checks out the head passes it and one that does not is refused: that is the point.
5. **No authority from the caller.** The source takes `eventName`, `event` and `trigger` only; a `head`, `judged`, `sha` or any other key is `INVALID_SOURCE`, as is a checkout without `parents` or with another key. The function reads no environment, no file and no Git, and does not change its input.
6. **`readCheckout(root)`.** The commit at `HEAD` and its parents, by Hosting's own Git start (`revision` plus `rev-list --parents`), with the rejections of `revision`.
7. **The command `kaal-hosting-judged-revision [--checkout <dir>]`.** Reads `GITHUB_EVENT_NAME`, `GITHUB_EVENT_PATH` and `GITHUB_SHA`, and prints one `kaal-hosting-judged-revision {…}` line: `result: "judged"` with the answer, or `result: "cannot-determine"` with the code and reason and no revision named. It prints facts and no verdict: exit `0` when the judged revision was determined, `2` when it could not be (an unreadable event is `EVENT_UNREADABLE`), never `1`, as `kaal-hosting-revision` does. A workflow passes its `judged` to `--revision` and `--expect-revision` of Testing's `observe-at` and its `trigger` to `--trigger-revision`.

Cases (executable drafts in `judged-revision.red.mjs`; they run on a checkout with the DO, and pass against it):

- hosting/T349: the head of a pull request, the new commit of a push and the head of a merge group are named, with the trigger beside them; on `pull_request_target` the trigger is the base and the judged one the head; a trigger not given is `null`; the id is lower case; a 64 character id is a revision; a field of another event is never read; the answer is frozen and the test merge commit is never judged.
- hosting/T350: an event that is not one of the four, a missing, short, non-hexadecimal, too long or all-zero id (judged or trigger), a push or merge group whose trigger is not its judged commit, a source or checkout with a key it does not take, and a source that is not an object are refused with the named code.
- hosting/T351: the checkout is tied: the judged commit itself, or on a pull request a merge of it; a merge that does not hold it, another commit and the base are `UNTIED`; a short id is `NOT_A_REVISION`; a checkout without parents is `INVALID_SOURCE`; on a push a merge commit is `UNTIED`.
- hosting/T352: the function reads no environment (a hostile `GITHUB_SHA` and event variables change nothing), imports nothing that reads the host (`node:fs`, `node:child_process`, `process.env`), and works on frozen input.
- hosting/T353: the command, on a scratch repository with a real test merge commit: the head judged, the merge commit as the trigger and the checkout `merge-of-judged`; no checkout given says `checkout: null`; a checkout that does not hold the judged revision exits `2` with `UNTIED` and names no revision; an unknown event and a missing event file exit `2`; it never exits `1`.

## Boundary with the other capabilities

- **Testing** (C84, #2881) owns the meaning of "judged revision" in evidence and the pure check. This Change supplies its `judged` and `trigger`; it does not decide whether a record is acceptable, and Testing does not read the event. This Change leans on nothing of C84 and can land before or after it.
- **Controls** would own a ratchet that no record boundary reads `GITHUB_SHA` for evidence. Separate, and it needs Kai's go.
- **Release** keeps its repaired records and `--head`; it can call the command or the function later, a change of its own. Nothing of Release changes here.
- **Hosting** holds the reading of the event and of the checkout, and nothing about verdicts.

## Design questions

1. **Event only.** The judged revision is read from the event of the run and never from an override. Release's `--head` and `KAAL_HEAD_SHA` stay Release's until it moves onto this. Proposed; the alternative is an `--assume` for manual runs, which is the route the defect took.
2. **Checkout optional in the function, passed by the evidence callers.** The tie is where the contract becomes real (C84's residual risk), but a caller with no working copy still needs the judged revision. Proposed; the alternative is a required checkout, which would refuse the Controls steps that run before a checkout.
3. **Four events.** `pull_request`, `pull_request_target`, `push` and `merge_group` are the ones the controls run on. A `workflow_run`, a `schedule` and a `workflow_dispatch` are refused until one of them judges something.
4. **Only a pull request has a test merge commit.** `merge-of-judged` is allowed on `pull_request` only. A merge group's checkout is the group's head itself.
5. **The name.** The command `kaal-hosting-judged-revision` is next to `kaal-hosting-revision` (which reads a ref's files) and does not replace it.

## Residual risks, kept visible

- A merge commit that has the head as a parent but another tree is not detected: the tie checks names (commit and parents), not content. GitHub's test merge commit is what the checkout action fetches; the check refuses what is not even a merge of the head, not a forged one.
- Package exports are not a sandbox: a caller that never calls the function and reads `GITHUB_SHA` is stopped only by the Controls ratchet, not by this Change.

## Not in this Change

Any DO. The ratchet; a change to Release's records or to Testing's check; a workflow, WIRE, flag, ruleset or required check; reading a run's checks or any call to GitHub's API (the event of the run is a file the runner wrote); a publication.

## DO

Not authorized by this PLAN. On the merged PLAN: `scripts/judged-revision.ts` (`judgedRevision`, `JudgedRevisionError`), `readCheckout` in `scripts/revision.ts`, their exports, the command `scripts/judged-revision-cli.mjs` (the build list, `bin` and the interface table), T349 to T353 as delivered Cases in `04-test/package-check/judged-revision.test.mjs` unchanged, the ids in `04-test/package-check/testing.md`, the element texts (I25, F113, A50), the README and operations entries.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
