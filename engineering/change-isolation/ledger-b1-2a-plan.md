# PLAN B1 step 2a: substantive `merge_group` evaluation for every required check

Date: 2026-11-07. Engineering PLAN, Markdown only, under the approved B1 PLAN (`ledger-b1-plan.md`, CPO approval at 8656c02). It changes no workflow, ruleset or checker, and authorizes no queue enablement, ruleset change, promotion or publication. Inspected on `kaal/engineering-b1` (main a4cfd5c); reacquire before use.

## Intent

The merge queue judges a temporary merge group at merge time. Every context the `main` ruleset requires must then be produced for that group, and each must judge the group, not wave it through. This plan says, for each required check, what the check reads today, what a merge group changes, what it will judge there, and the RED Case that proves it does not pass a defective group. A check that cannot be made substantive gets no `merge_group` trigger, and then the queue is not enabled (the CPO's condition).

## What a merge group is

For a `merge_group` event GitHub provides `merge_group.head_sha` (the group commit: the target tip plus the queued PR's commits), `merge_group.base_sha` (the target tip), `merge_group.base_ref`, and `merge_group.head_ref` (a `gh-readonly-queue/...` branch). There is no `pull_request` object: no PR number, head ref, author or auto-merge setting. Workflows run on the group commit, so `actions/checkout` of the default ref yields the group tree. The squash that follows creates a different commit with the same tree as the group's net result.

## Required checks on `main` and what each does for a group

| Required context | Producer today | Reads from the PR event | Substantive behaviour on `merge_group` |
|---|---|---|---|
| Hosting (Linux, Windows, macOS), Acceptance, Acceptance (Windows, macOS), Engineering, Workspaces | `ci.yml` jobs on `pull_request` | the checked-out merge ref only | Same jobs, same commands, checking out the group commit. Adding the trigger is substantive because they test the group tree. No PR fact is read. |
| CodeQL (actions), CodeQL (javascript-typescript) | `codeql.yml` on `pull_request` | the checked-out ref | Run the analysis on the group commit. Whether the code-scanning upload is accepted for a `gh-readonly-queue` ref must be verified on the disposable target; if the analysis cannot be reported for the group, this check cannot be made substantive and the queue stays off. |
| Change Isolation | `change-isolation.yml` on `pull_request_target` (default-branch code) | base ref, head sha | New `merge_group` job named exactly `Change Isolation`: the same checker, `--base merge_group.base_sha --head merge_group.head_sha`, the changed paths from that range, and the ledger read from the target tip. A carried entry without an attestation fails here exactly as at the PR (R1 stays strict until activation). |
| Branching | `lineage-synchronization.yml` on `pull_request_target` | base ref, head sha, head ref, auto-merge method | The lineage rules depend on the PR's head ref and its auto-merge method, which a group does not carry. The group is judged against the rules that remain true of it: the target is the base ref, the net result is a squash of one Change into a collector or a promotion into `main`, and (for a sync) a merge commit only for main to a `kaal/*` collector. The head ref and auto-merge method come from the queued PR, looked up by the trusted job from `merge_group.head_ref` (`gh-readonly-queue/<base>/pr-<n>-<sha>`) through the API, then judged by the existing checker with the same facts. If that PR cannot be found, the job fails. |
| Promotion Source | `promotion-source.yml` on `pull_request_target` | head repo, head ref | Same lookup of the queued PR from `merge_group.head_ref`, same checker. Fails when the PR cannot be found or the source is not a `kaal/*` collector of this repository. |

`Guard`, `Guard (macOS)` and `Guard (Windows)` are required only on `kaal/*` (the lineage ruleset), not on `main`; they are out of scope until a queue is considered for `kaal/*`.

## Rules for every added trigger

1. No job returns success unconditionally, and none is skipped with `if:` so that a missing context appears green. A skipped required job reports as skipped and blocks or passes depending on the platform, so none is used.
2. A merge-group job that cannot read a fact it needs fails (fail-closed), and reports why.
3. Trusted code only: for the lineage-type checks the job checks out the default branch and runs the default branch's checker (as today); it does not execute code from the group.
4. The new `merge_group` jobs carry the same contexts as today (bare job name, pinned to Actions), so the ruleset needs no new entries for them.
5. The `.github` Change containing these triggers contains no other paths (the `.github` travels-alone rule), and its own Change Isolation, Branching and Promotion Source results at the PR are the ordinary ones.

## RED Cases (by hand, then live on the disposable target)

Each proves a defective group is refused, per check:

- C1 Hosting/Acceptance/Engineering/Workspaces: a group whose tree breaks one test fails that job on the group commit.
- C2 CodeQL: the analysis runs on the group and reports (or the check is declared not substantive and the queue stays off).
- C3 Change Isolation: a group whose path set needs an entry it lacks fails; a group carrying an unattested entry fails (R1 strict).
- C4 Branching: a group whose queued PR targets the wrong branch for its kind fails; a group whose PR cannot be looked up fails.
- C5 Promotion Source: a group from a source that is not a `kaal/*` collector fails.
- C6 Static: no merge-group job is `if:`-skipped and none ends in an unconditional success (a workflow lint Case, T-numbered when written).

## Delivery

1. This PLAN, CPO review.
2. The `.github` Change adding the triggers and jobs (alone), with C6 as a static Case. No ruleset change, so nothing is queued yet and ordinary PRs are unaffected (`merge_group` runs only for a queue).
3. The Owner creates the disposable target and its ruleset copy; B1-0 (effective-rules equivalence) is run; C1 to C5 run live there.
4. Only then the R2 workflow and the checker's deferred mode, with R1 strict; then the Owner's queue and R2 requirement on `main`; then the activation Change.

## Risks named

- The Branching and Promotion Source lookups read the queued PR through the API from a trusted job; the lookup is a new read path and is itself a RED Case target (C4, C5).
- CodeQL on `merge_group` may not report; if so the queue cannot be enabled while CodeQL is required, and the CPO and Owner decide between making CodeQL non-required for the queue or not using the queue. Engineering does not weaken the requirement on its own.
- A longer queue wait is the cost of running the full matrix on each group.

## Decisions for the CPO

1. Approve this per-check design before any workflow is written.
2. Confirm that a check that cannot be made substantive (CodeQL is the likely one) is brought back as a decision, not silently dropped.
