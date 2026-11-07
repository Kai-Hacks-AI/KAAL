# PLAN B1: a distinct required check for the ledger attestation

Date: 2026-11-07, revised for the CPO review of head 01de708 (fail-closed revocation). Engineering PLAN for CPO review. It is Markdown only. It changes no checker, workflow, ruleset or ledger, and authorizes no ruleset change, promotion or publication. Inspected on `main` a4cfd5c; reacquire before use. Follows the CPO decision of 2026-11-07 (B1 accepted, C rejected) and the stopped live trial on #1109 (head 3cf570b).

## Intent

A promotion must be able to carry its own ledger entry (PLAN #1019) and be admitted only while an author-independent, exact-head attestation stands, and any way that attestation disappears must leave it blocked. The live trial showed the handler validates and revokes correctly, but its check run does not satisfy the required status, because the required context is the pull request job's own check. So the system is safely blocked and cannot admit a legitimate ledger-bearing promotion.

## Finding being answered

On #1109, with the approval standing and handler run 128210400582 = success, the merge box still showed Required `KAAL / Change Isolation (pull_request_target)` failing. Two producers of one name do not combine: the required context belongs to the PR job, and an API-created run of the same name is not that context.

## Design: two required contexts, one producer each

| Context | Producer | Question it answers |
|---|---|---|
| R1 `KAAL / Change Isolation (pull_request_target)` (existing) | the PR job, trusted code from the default branch | Are the rules satisfied *if* every needed attestation exists? |
| R2 `KAAL / Change Isolation (review) (merge_group)` (new) | a GitHub-created job of a workflow triggered by `merge_group`, running at merge time | Does every needed attestation exist, at the exact head being merged, NOW? |

Merge needs R1 and R2. Neither producer writes the other's context.

1. **R1 judges with attestation deferred** (`--attestation deferred`): success when the only unmet condition is the missing attestation of a well-formed carried entry (one appended entry, paths and blobs exact, never admitting `.github`, the ledger or the checker). Every other refusal stays a refusal; with no carried entry R1 is today's verdict. It prints the pending `id:digest`.
2. **R2 judges in full at merge time.** The repository enables the merge queue on `main`. When a PR is queued (by auto-merge or by hand), GitHub starts the `merge_group` workflow and creates the job's check itself. The job reacquires everything from the API at that moment (PR, head, reviews, pinned attesters, target ledger), derives the attestation exactly as the handler does, runs the checker in full (no carried entry: today's rules), and fails unless the verdict is success and the judged head equals the head being queued. R2 is therefore a fresh judgement for each merge attempt. It has no earlier success to go stale.
3. **No API write is on the safety path.** GitHub, not our code, creates R2's check run. If the job cannot read the reviews, cannot start or crashes, R2 is red or missing, and a missing or red required check blocks the queue entry. The earlier residual (a replacing approval lacking the line, plus failure to create a newer run) cannot arise: there is no newer run to create, and no standing success to supersede.
4. **The review-event handler becomes advisory.** It may keep reporting `Change Isolation (review event)` early on the PR (feedback only). It is not required and nothing depends on it.

## Why the workflow definition can be trusted at merge time

A `merge_group` run uses the workflow file from the merge-group commit (target plus the PR), so a candidate could in principle edit it. It cannot for any change that needs R2: a change carrying a ledger entry may touch no `.github` path (the entry never admits `.github`, and `.github` travels alone, both enforced by R1), and a change that touches `.github` carries no entry. The R2 workflow file is therefore identical to `main`'s for every change where attestation matters, and any `.github` change is judged by the ordinary rules. If the Owner's plan supports repository rules "require workflows" with a pinned ref, that is a stronger alternative; it is not needed for soundness.

## Trust boundaries

- R1 and R2 run default-branch code (R2 per the argument above). Nothing else from the candidate executes in either.
- The attester ids come from `attesters.json` at the target; reviews and CODEOWNERS are read from the API, never from the candidate.
- Ruleset: R2's context is required and pinned to the producing app (GitHub Actions) if supported (Owner decision).
- The existing relay and handler keep their current trust model and gain no authority.

## Failure behavior

| Failure | Result |
|---|---|
| Reviews cannot be read at queue time | R2 red: queue entry blocked |
| R2 job does not start, crashes or is cancelled | R2 missing or red: blocked |
| Approval dismissed, replaced by changes-requested, or replaced by an approval lacking the line, after PR checks were green | R2 judged afresh at queue time: red |
| Head moves | R1 re-evaluates; R2 judged for the head actually queued; no inherited success |
| Handler or relay down | no effect on safety (advisory) |
| Merge queue not available or not enabled | B1 is not deployable as written: Decision 1 below |

## The stale-success contract, demonstrated

A stale success cannot survive because R2 never exists before the merge attempt and is never carried over. Dismissal, replacement and head change are shown live (Cases below) by observing the queue-time R2, with the check-run history and merge-box reading recorded. The negative API-failure evidence is of two kinds, stated honestly: (a) a by-hand Case (T111) in which the R2 judging step runs against a stub `gh` failing every read, ending red, which shows the script; (b) the structural fact, checked in the workflow file by a static Case, that the R2 job has no `checks: write` permission and no step that creates a check run, so there is no write whose failure could leave a success standing. GitHub's own behaviour (a failed or missing job blocking a queue entry) is shown live by Case B1-5.

## Acceptance Cases (live on #1109 once implemented, plus by-hand RED Cases)

Each Case records the head SHA, every R1 and R2 check-run id with status, conclusion and timestamps, both Required rows on the merge box and the queue state, and run links. The trial PR is queued by hand and removed from the queue before it can merge; it is never merged (a protected requirement of the trial: the unattested cases fail the queue, and for the attested case the Owner removes it from the queue or R2 is the last check observed and the entry is dequeued by a pushed no-op to the head).

- B1-1 baseline, no review: R1 green (deferred), queue blocked with R2 red.
- B1-2 attest: approval with the exact line; at queue time R2 green.
- B1-3 dismiss after PR checks were green: queue-time R2 red.
- B1-4 replace: approval, then changes-requested, then an approval without the line: queue-time R2 red each time. This is the CPO's named case.
- B1-5 reviews unreadable or job failing at queue time: R2 red or missing, entry blocked (live, using a trial head whose attestation read cannot succeed, e.g. a PR whose reviews belong to an unpinned account; plus T111 for the script).
- B1-6 moved head: queue-time R2 is for the new head.
- B1-7 self-attestation by the author: R2 red.
- B1-8 wrong digest or id: R2 red.
- B1-9 an ordinary PR with no carried entry: R2 green at queue time; it does not block ordinary work.
- B1-10 R1 deferred never over-admits: bad shape or a path set without an entry is red on R1 regardless of attestation (by-hand RED Case on the checker).
- B1-11 static: R2's workflow has no check-write permission and creates no check run.

## Rollout, each step separately approved

1. This PLAN reviewed by the CPO.
2. Deployment, activation held back. `.github` alone: the `merge_group` workflow (R2). Separately, the checker's deferred mode, shipped with R1 still STRICT (the PR job does not pass `--attestation deferred`). R2 exists but is not required and R1 behaves as today, so a carried entry still cannot pass and no gap opens.
3. Owner enables the merge queue and requires R2 on `main`. R2 is observed blocking on a head with no attestation and green on an ordinary PR. Only then a separate small `.github` Change activates deferred mode in R1 (one flag), approved at its exact head. Rollback runs in reverse: restore strict R1, then the Owner removes the R2 requirement and the queue. R1 is never deferred while R2 is optional.
4. Repeat the full live trial with all Cases, commit `first-use-acceptance.md` and T111.
5. Only then Hosting #1030 returns for promotion assessment.

## Out of scope

No ruleset change, merge-queue enablement, Hosting promotion or npm publication. #1109 stays open, unmerged, auto-merge off; its branches are kept. Codex's P2 on activation order is resolved by step 2 and 3 above (thread resolved).

## Decisions

1. Owner/CPO: confirm the merge queue is available for `main` on this plan, and accept it as the revocation mechanism. If it is not available, the fallback is a promote job (trusted, `workflow_dispatch`) that re-reads the attestation and merges with the head sha pinned in one job, and R2 exists only inside that job. That fallback leaves a seconds-wide window and needs its own PLAN.
2. Owner: pin R2 to the GitHub Actions app in the ruleset, if supported.
3. The ruleset change and queue enablement stay separate Owner authorizations.
