# hosting/C118 change

## From

Each caller that records evidence decides for itself where its revision comes from, and the variable that is closest (`GITHUB_SHA`) is the revision of the trigger, not the head the event names and not necessarily the commit that was checked out. The facts of a run (what the event names, what triggered it, what the working copy holds) are facts about GitHub's events and about the host, and Hosting states them once. Which of them was examined, and whether a record is about it, is a judgment, and it is not Hosting's.

## To

One pure function, one reader of the checkout and one command. All of them state facts and none decides.

1. **`runRevisions(source, checkout?)`.** `source` is `{ eventName, event, trigger? }`: the name of the event, its payload, and the revision of the trigger (`GITHUB_SHA`) when the caller has it. The head the event names is read from the event and from nowhere else: `pull_request` and `pull_request_target` at `event.pull_request.head.sha`, `push` at `event.after`, `merge_group` at `event.merge_group.head_sha`. Any other event is `UNSUPPORTED_EVENT` (a `workflow_run`, a `schedule` and a `workflow_dispatch` name no head of their own; a later Change may add one). A field of another event in the payload is never read.
2. **The answer, as distinct facts.** A frozen `{ event, eventHead: { revision, source }, trigger, checkout, relations }`: `eventHead` is the head the event names and where it stands; `trigger` is the given revision or `null` (never invented); `checkout` is `{ commit, parents }` as given, or `null`. Revisions are full commit ids in lower case (40 or 64 hexadecimal characters, the same revision as Testing's check; an abbreviation, a missing id and the id of a deleted ref, all zeros, are `NOT_A_REVISION`). The answer has no field called judged or examined, and none that is a verdict.
3. **Relations, stated and not judged.** `relations` holds four booleans: `triggerIsEventHead`, `checkoutIsEventHead`, `checkoutIsTrigger` and `eventHeadIsCheckoutParent` (the head the event names is a parent of the checkout, as it is of a test merge commit). Each is `null` when an input it needs was not given: nothing is said about it. A relation that is `false` is a fact, not a refusal: a push whose trigger is not its new commit, a checkout that is not the head and a merge that does not hold the head are stated and returned. No relation is named as enough, and Hosting does not call a merge checkout equivalent to the head.
4. **No authority from the caller.** The source takes `eventName`, `event` and `trigger` only; a `head`, `judged`, `sha` or any other key is `INVALID_SOURCE`, as is a checkout without `parents` or with another key. The function reads no environment, no file and no Git, and does not change its input.
5. **`readCheckout(root)`.** The commit at `HEAD` and its parents, by Hosting's own Git start (`revision` plus `rev-list --parents`), with the rejections of `revision`. It reports what the working copy holds and nothing about it.
6. **The command `kaal-hosting-run-revisions [--checkout <dir>]`.** Reads `GITHUB_EVENT_NAME`, `GITHUB_EVENT_PATH` and `GITHUB_SHA`, and prints one `kaal-hosting-run-revisions {…}` line: `result: "facts"` with the answer, or `result: "cannot-determine"` with the code and reason. It prints facts and no verdict: exit `0` when the facts were read, whatever they say, `2` when they could not be (an unreadable event is `EVENT_UNREADABLE`), never `1`, as `kaal-hosting-revision` does. A consumer reads the facts, establishes what it examined, and gives Testing's `observe-at` its `--revision`, `--expect-revision` and `--trigger-revision`.

Cases (executable drafts in `run-revisions.red.mjs`; they run on a checkout with the DO, and pass against it):

- hosting/T349: the head the event names, the trigger and the relations are stated for a pull request, a `pull_request_target`, a push and a merge group, with the trigger `null` and its relation `null` when not given; the id is lower case; a 64 character id is a revision; a field of another event is never read; the answer is frozen; and no field is named as what was judged or examined, and none is a verdict.
- hosting/T350: an event that is not one of the four, a missing, short, non-hexadecimal, too long or all-zero head, a bad trigger, and a source or checkout of the wrong form are refused with the named code; a push whose trigger is not its new commit is stated (`triggerIsEventHead: false`), not refused.
- hosting/T351: the checkout is stated as it is and related to the event head and the trigger: the head itself, the test merge commit that has the head as a parent, a merge that does not hold it and another commit are four different answers, none refused and none called enough; without a trigger nothing is said about it; letter case does not matter; a short id is `NOT_A_REVISION` and a checkout without parents is `INVALID_SOURCE`.
- hosting/T352: the function reads no environment (a hostile `GITHUB_SHA` and event variables change nothing), imports nothing that reads the host (`node:fs`, `node:child_process`, `process.env`), and works on frozen input.
- hosting/T353: the command, on a scratch repository with a real test merge commit: the head the event names, the merge commit as the trigger, the checkout and the four relations side by side; no checkout given says `checkout: null`; a checkout that does not hold the head is stated and exits `0`; an unknown event and a missing event file exit `2`; it never exits `1`.

## Boundary with the other capabilities

- **Hosting** (this Change) states the facts of a run and nothing about what they mean for evidence.
- **The consumer** (a workflow, a control, Release's records) establishes what it examined, and says it: the recorded revision, the expected revision and the trigger. It is the one that decides that an event head, a checkout or a merge is the scope of its evidence.
- **Testing** (C84, #2881) owns the meaning of "judged revision" in evidence and the pure check of a record against it. It takes its three inputs from the consumer; the facts here are one source for them, and this Change leans on nothing of C84.
- **Controls** would own a ratchet that no record boundary reads `GITHUB_SHA` for evidence. Separate, and it needs Kai's go.
- **Release** keeps its repaired records and `--head`; it can read these facts later, a change of its own. Nothing of Release changes here.

## Design questions

1. **Facts, not the head to trust.** The event head is one fact among three. A consumer that wants to record it as what it examined says so itself, and Testing checks the record against that scope. Proposed by the Owner's boundary; the alternative (Hosting naming one revision as judged) is the first draft of this PLAN and was held.
2. **Relations as booleans.** Four booleans and `null` for "not given" keep the facts distinct and make no relation a label. The alternative, a free list of relations, would let a label creep in. Proposed.
3. **A disagreement is returned.** A trigger that is not the new commit of a push, and a checkout that does not hold the head, are stated. Refusing them would make Hosting the judge. Proposed.
4. **Four events.** `pull_request`, `pull_request_target`, `push` and `merge_group` are the ones the controls run on; any other is refused until one of them names a head.
5. **The name.** The command `kaal-hosting-run-revisions` is next to `kaal-hosting-revision` (which reads a ref's files) and does not replace it.

## Residual risks, kept visible

- Hosting cannot say what the consumer examined. A consumer that records the event head while it examined another commit is not detected here; the facts side by side (the checkout and its relations) are what a reviewer and Testing's check can compare it with.
- A merge commit that has the head as a parent but another tree: the relations are names (commit and parents), not content.
- Package exports are not a sandbox: a caller that never calls the function and reads `GITHUB_SHA` is stopped only by the Controls ratchet, not by this Change.

## Not in this Change

Any DO. The ratchet; a change to Release's records or to Testing's check; a decision of what counts as the examined revision; a workflow, WIRE, flag, ruleset or required check; any call to GitHub's API (the event of the run is a file the runner wrote); a publication.

## DO

Not authorized by this PLAN. On the merged PLAN: `scripts/run-revisions.ts` (`runRevisions`, `RunRevisionsError`), `readCheckout` in `scripts/revision.ts`, their exports, the command `scripts/run-revisions-cli.mjs` (the build list, `bin` and the interface table), T349 to T353 as delivered Cases in `04-test/package-check/run-revisions.test.mjs` unchanged, the ids in `04-test/package-check/testing.md`, the element texts (I25, F113, A50), the README and operations entries.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
