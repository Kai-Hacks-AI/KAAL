# B1 first use: a promotion that carries its own ledger entry, judged at merge time

Status: trial complete on `main`, 8 November 2026. This record is the acceptance evidence for design B1
(`ledger-b1-plan.md`); the CPO reviews it before Hosting #1030 returns for promotion assessment.

## What was shown

A promotion that carries its own transition-ledger entry is admitted by structural validation at the pull request
(R1, `Change Isolation`, deferred attestation), and the attestation is then judged at merge time, on the merge queue's
group commit, by `Change Isolation (review)` (R2). Without the attestation the group is rejected and nothing merges.
With it, the same promotion merges. Both were observed live on `main`, on the same pull request and head.

## The control, in one line each

- R1 (pull request job, handler, and the merge group's `Change Isolation` job) runs the checker with
  `KAAL_ATTESTATION=deferred`. It admits a well-formed carried entry (paths, pre and post blobs) and prints
  `attestation deferred: ledger-entry: <id> sha256:<digest> (the review check judges it)`. An explicit attestation is tried
  first and wins; deferred applies only when none is supplied. It never admits `.github`, ledger or checker paths.
- R2 (`Change Isolation (review)`, merge_group) is the last required check to finish. It binds the group to the queued pull
  request and its exact head, reads the approvals (`attest.mjs`), judges strictly, and reads the approvals again as its final
  act. It writes no check run.
- The queue is SQUASH, one entry per group, wait 0, ALLGREEN, 60 minute timeout.

## Evidence (all on `Kai-Hacks-AI/KAAL`, ruleset 24951062)

| Step | Pull request | Result |
| --- | --- | --- |
| Control: an ordinary change through the queue | #1119 | merged via queue (9d4e059b); every required check, CodeQL included, green on the group |
| Pre-activation negative: unattested ledger content under strict R1 | #1148 (replaced by #1151) | refused by strict R1; the first candidate also broke the establishment rule and was replaced |
| Activation: the deferred flag in the pull request job and the group's judging job | #1146 / #1150 | merged via queue (main 7d6e965); flag verified live in both jobs |
| F5: the flag in the approval-event handler | #1152 / #1156 | merged via queue (main e25a9342); without it the handler re-judged strictly on approval and overwrote R1's pass |
| Case 6, negative | #1162 @ a5be193d | enqueued with an approval carrying **no** attestation line (review 5815065284) |
| Positive | #1162 @ a5be193d | enqueued with an approval carrying `ledger-entry: ledger-trial-2026-11-07 sha256:8ee627fba7d559b5a50d0cf9c96d893d28424cccc2bccaaea19cb80772ede6f0` (review 5817156313) |

### Case 6 (negative), group a18edf21901639da5a9ff8de5aeea95a5f292c9d on base e25a9342

- R1 `Change Isolation` job 128671863910: success, `KAAL_ATTESTATION: deferred`, `ok: 3 changed paths conform`, and the
  pending line for `ledger-trial-2026-11-07`.
- `Branching` 128671864062, `Promotion Source` 128671863979, both CodeQL checks: success.
- R2 `Change Isolation (review)` job 128671864023 (run 42461601435): **failure** in "Judge the group against its base", with
  `ATTESTED` empty. The strict checker's wording is `core travels alone: engineering/change-isolation/transitions.json is
  not Core or its supporting files`; it does not say "missing attestation" (the same text as the pre-activation refusal).
  The cause is established by contrast: the same group commit passed R1 under deferred and failed R2 under strict, and the
  attestation is the only difference.
- The queue dequeued the entry at 08:10:06 with CI_FAILURE. #1162 stayed open, `main` stayed e25a9342.

### Positive, group 9a89e80a84136750b7bdb632e936939ff4c2969d on base e25a9342

- The handler (run 42461978911) read `ATTESTED` as `ledger-trial-2026-11-07:8ee627fb…` and passed.
- R1 job 128673112532: success with the pending line. R2 job 128673112046: **success**, `ATTESTED` =
  `ledger-trial-2026-11-07:8ee627fba7d559b5a50d0cf9c96d893d28424cccc2bccaaea19cb80772ede6f0`, `ok: 3 changed paths conform`.
- All required checks succeeded; the queue merged #1162 at 08:15 as one squash commit, `main` = 9a89e80a (parent e25a9342),
  adding exactly `engineering/change-isolation/transitions.json` (one entry), `engineering/change-isolation/trial-note.md`
  and `packages/kaal-core/bench/ledger-trial-note.md`.

## Defects found and fixed on the way

- F3: the squash group is one commit whose parent is the base; the group is bound by parent and tree, not by ancestry.
- F4: under a queue GitHub clears the pull request's auto-merge field; the group's method now comes from the queue rule.
- F5: the approval-event handler is deferred in its judging step, and nowhere else, so it cannot override the pull request
  job's pass or weaken R2. Explicit attestation still wins; an invalid explicit attestation is never converted into deferred.
- A collector whose tree predates the deferred-capable checker cannot be judged once deferred is global ("cannot judge"):
  synchronize `main` into it first.

## Governance: the queue and R2 are now security-critical controls

Deferred attestation is safe only while the merge queue and the required `Change Isolation (review)` context are in force.
Without them R1 would admit an unattested ledger entry and nothing would reject it. The Owner therefore confirmed on
8 November 2026 that the current ruleset is the **permanent** configuration and that the pre-trial ruleset is not restored:

| Setting | Value |
| --- | --- |
| Merge method | SQUASH |
| Queue concurrency / group size | 1 / 1 |
| Wait | 0 |
| Strategy | ALLGREEN |
| Timeout | 60 minutes |
| `Change Isolation (review)` | required |
| Existing required checks | retained, CodeQL included |

Any later change to the queue, to the required status of `Change Isolation (review)` or its enforcement, or to the three
deferred flags is a governance change and needs explicit authorization. Rolling back runs in reverse: strict R1 first
(remove the three flags), only then the R2 requirement and the queue.

## Limits stated plainly

- The attestation is checked at the last moment our code runs, not atomically with the merge (plan Decision 3). The window is
  GitHub's merge latency.
- R2's rejection message is the strict checker's structural wording, not an "attestation missing" text.
- B1 Cases other than the ones listed (dismiss, replace, moved head, self-attestation, withdrawal while queued) were not run
  live in this trial; the by-hand Cases cover the script halves (T111 for unreadable reads).
- Guard's Windows and macOS checks are not required contexts; they were still running on the group when it merged.
- The `Branching audit` on `main` after the merge fails on ten pre-existing stale branches (for example `kaal/acceptance`,
  `claude/testing-sync-main`); none is a trial branch. It is unrelated to this trial and needs housekeeping separately.

## Follow-up that does not need a decision

`#1160` (handler Cases) and `#1161` (activation Cases) wait, synchronized and re-approved, for promotion.
Trial collectors and work branches are housekeeping and are deleted only with the Owner's approval.
