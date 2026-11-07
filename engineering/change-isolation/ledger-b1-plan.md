# PLAN B1: a distinct required check for the ledger attestation

Date: 2026-11-07. Engineering PLAN for CPO review. It is Markdown only. It changes no checker, workflow, ruleset or ledger, and authorizes no ruleset change, promotion or publication. Inspected on `main` a4cfd5c; reacquire before use. Follows the CPO decision of 2026-11-07 (B1 accepted, C rejected) and the stopped live trial on #1109 (head 3cf570b).

## Intent

A promotion must be able to carry its own ledger entry (PLAN #1019) and be admitted only while an author-independent, exact-head attestation stands, and any way that attestation disappears must leave it blocked. The live trial showed the handler validates and revokes correctly, but its check run does not satisfy the required status, because the required context is the pull request job's own check. So the system is safely blocked and cannot admit a legitimate ledger-bearing promotion.

## Finding being answered

On #1109, with the approval standing and handler run 128210400582 = success, the merge box still showed Required `KAAL / Change Isolation (pull_request_target)` failing. Two producers of one name do not combine: the required context belongs to the PR job, and an API-created run of the same name is not that context.

## Design: two required contexts, one producer each

| Context | Producer | Question it answers |
|---|---|---|
| R1 `KAAL / Change Isolation (pull_request_target)` (existing) | the PR job, untrusted trigger, trusted code from the default branch | Are the rules satisfied *if* every needed attestation exists? |
| R2 `Change Isolation (review)` (new, API check run) | the trusted handler only, from the default branch | Does every needed attestation exist, at this exact head, now? |

Merge needs R1 and R2 both green. Neither is ever written by the other producer, so no ordering between same-named runs by different producers is needed.

1. **R1 (PR job) judges with attestation deferred.** The checker gets one mode, `--attestation deferred`. It reports success when the only unmet condition is the missing attestation of a well-formed carried entry (one appended entry, paths and blobs exact, never admitting `.github`, the ledger or the checker). Every other refusal stays a refusal. It prints the pending `id:digest` into the check summary. With no carried entry R1 is exactly today's verdict. Deferred mode never admits a change that has no carried entry.
2. **R2 (handler) judges in full**, as today's handler, for every head. No carried entry: success ("no attestation needed"). Carried entry: success only if the derived attestation matches (approved review at this head, pinned code-owner id, latest ruling, exactly one matching line, head unchanged at the end). Anything else: failure. The required R2 is thus green only through a positive judgement made for this head.
3. **R2 exists on every head.** The handler additionally triggers on `workflow_run` of the `KAAL` workflow (completed), so each push, open and reopen gets its R2 even with no review. It reacquires the PR and head from the API (`commits/{sha}/pulls`), never from the payload alone. A head with no R2 run is *missing*, and a missing required context blocks the merge. This is the fail-closed base.
4. **Review events** (relay, as today) re-run the handler: it creates R2 `in_progress` for the current head first, judges, then completes it, the finalizer completing it success only if verdict success and judged head == pending head == current head.

## Trust boundaries

- Both producers run default-branch code. Nothing from the candidate (workflow YAML, scripts, ledger, checker) executes in either.
- The relay stays untrusted and carries only the PR number. The handler trusts nothing from it except that number, and cross-checks it as today.
- R2 is written only by the handler token (`checks: write`). The PR job gets no `checks: write`.
- The ruleset names R2 by context string. If the platform allows, the ruleset also pins the producing app (`github-actions`) so a look-alike check from another app does not count. An Owner decision.

## Failure behavior

| Failure | Result |
|---|---|
| Handler never runs on a new head | R2 missing: merge blocked |
| Handler cannot read PR, head or reviews | R2 left unsuccessful (failure or missing): blocked |
| Handler cannot create R2 for a *new* head | R2 missing: blocked (structural) |
| Approval dismissed, replaced by changes-requested, or replaced by an approval without the line | handler creates a newer R2 run `in_progress` then failure |
| Head moves | R2 for the old head is irrelevant: checks are per head; the new head has no R2 until judged for it |
| Relay fails or is cancelled | the handler is also reachable via `workflow_run` of `KAAL` and the next review event; the missing case above applies |

## The one claim that needs demonstrating: a stale success must not survive

Structural facts, true by construction: R2 is per head SHA, so a changed head never inherits a success. A dismissed or absent approval at a *new* head cannot be stale because no R2 success exists yet for that head.

The remaining case is *same head, attestation withdrawn after R2 success* (dismissal, a changes-requested review, or a replacing approval without the line). Here correctness rests on the handler creating a newer run. The plan does not assume ordering of same-named runs. It demonstrates it with the Cases below, on the real ruleset, reading the merge box and the check-run history. It names the part that stays open:

- **Open residual (narrower than before).** If the withdrawal happens *and* the handler cannot create any new R2 run (three retries failed), the earlier R2 success on that head stands. Dismissal of the only approval still blocks through the ruleset's own required code-owner review, so the residual is only a replacing approval that lacks the line, plus an API failure. It cannot be tested live (the API cannot be made to fail on demand). T111 (stub `gh`) shows the handler's behaviour only, not GitHub's. Options for the CPO: (a) accept it as a documented, narrow residual; (b) add a scheduled reconcile on `main` that re-judges open PRs whose R2 is green and completes any stale one as failure (closes it by design at the cost of a cron workflow).

## Acceptance Cases (run live on #1109 once implemented, plus by-hand RED Cases)

Every Case records the head SHA, every R1 and R2 check-run id with status, conclusion and timestamps, the merge box reading for both Required rows, and the run links.

- B1-1 baseline: no review. R1 green (attestation deferred), R2 failure, blocked.
- B1-2 attest: approval with the exact line. R2 green, R1 green, Branching aside, mergeable except by design.
- B1-3 dismiss: R2 newer run failure; merge box R2 red. The earlier success must not be the standing reading.
- B1-4 replace: approval, then changes-requested; then approval without the line. R2 red each time.
- B1-5 moved head: approval at A, push B. B has no R2 success; A's success does not count for B.
- B1-6 self-attestation by the author: R2 red.
- B1-7 wrong digest or id: R2 red.
- B1-8 relay cancelled: the handler still produces R2 for the head; red when unattested.
- B1-9 head with no review at all, a non-carrying PR: R2 appears green by `workflow_run` of `KAAL` (it does not block ordinary PRs).
- B1-10 R1 deferred never over-admits: carried entry with a bad shape, or a path set without an entry, is red on R1 regardless of attestation (by-hand RED Case on the checker, `--attestation deferred`).
- T111 (by hand): the handler's first step against a stub `gh` failing on read and on `POST check-runs`. Supports the script only. Recorded as supporting, never as proof of GitHub behaviour.
- Live check-run creation failure: recorded as UNVERIFIED unless residual option (b) is chosen, in which case a reconcile Case is added.

## Rollout, each step separately approved

1. This PLAN, reviewed by the CPO with its Cases.
2. Implementation Change, `.github` alone (handler `workflow_run` trigger on `KAAL`; handler check named `Change Isolation (review)`), plus the checker's deferred mode as a separate non-`.github` Change. Both promote to `main` with exact-head CPO approval. Until the ruleset change, R2 exists but is not required, so ordinary PRs are unaffected.
3. Owner authorizes the ruleset change: add `Change Isolation (review)` as a required status check on `main`. Before it, confirm R2 appears green on a harmless PR. Rollback: remove the requirement (Owner action); the checker reverts to today's behaviour by removing deferred mode.
4. Repeat the full live trial on #1109 (rebased as needed) with all Cases above, then commit `first-use-acceptance.md` and T111.
5. Only then Hosting #1030 returns for promotion assessment.

## Out of scope

No ruleset change, Hosting promotion or npm publication. #1109 stays open, unmerged, auto-merge off; its branches are kept.

## Decisions for the CPO

1. Residual: (a) accept narrow residual, recommended on cost, or (b) scheduled reconcile. Engineering recommends (a) first, with (b) as a later follow-up if the residual is judged material.
2. Pin the producing app in the ruleset (recommended) if the ruleset supports it.
