# C153 change

## Reason

From 2 December 2026 the four required checks below stop reporting. Each needs a replacement that decides from files and git content on plain `pull_request`, with evidence before any ruleset is touched.

## The four checks, in order, and what each needs

1. **Change Isolation** (`change-isolation.yml`). Replacement: `isolate Changes` of controls ACT, advisory and live since 25 Nov (`KAAL_RELEASE_ISOLATE_CHANGES`). Needs: run evidence read, a statement that it covers what the old check judged, then the swap. First, because it already runs.
2. **Branching** (`lineage-synchronization.yml`). Replacement: its promotion-freshness verdict retires into the merge queue (release/I63, CTL32, the `promoting` ruleset's queue rule), and the lineage part is judged from git by verify Sync (release/C152) and the Dispatcher (release/C136). Needs: the queue rule loaded by the Owner, C152 and C136 DOs on the line, evidence.
3. **Change Isolation (review)** (`merge-group-admission.yml`). Replacement: the same judge as 1 on the merge group, plain `merge_group`. Needs: check 1 proven, then the same judge wired for the queue event.
4. **Promotion Source** (`promotion-source.yml`). Replacement: a promotion source judged from the pull request as Git data, with the host adapter supplying trustworthy bytes (the one item the CPO and CTO hold). Last, because it guards `main` and needs the CTO's trust-boundary proof before DO.

## Dependencies on the Inspector (the owner-agreed trusted relay)

- **Checks 1 to 3 have no Inspector dependency.** They decide from files and git content on plain `pull_request` or `merge_group`, need no token, and go first.
- **`approve Sync` and `review Sync` wait on the Inspector.** They hold a token that a plain `pull_request` run does not have. Release's design for that token is the Inspector: an unprivileged run produces data, and a trusted default-branch `workflow_run` job reads it as data and holds the token. `verify Sync` itself moves to plain `pull_request` in release/C152 and does not wait.
- **Check 4 (Promotion Source) waits on three things:** the Inspector, the host adapter that supplies trustworthy bytes of the source and the preimage from `main` (Hosting), and the CTO's trust-boundary proof. By the ownership cut proposed to the Owner, Release owns the Promotion Source control and Hosting owns the adapter; this is not settled until the Owner rules.
- **Status of release/C133, read at this time:** its revised PLAN (#2494) is merged into `kaal/release/delivery-ruleset-gates`; it records that a required workflow runs from the ruleset's ref and not from the pull request, and it authorizes no DO, WIRE, ruleset change or flag. The Inspector's own collector is `kaal/release/inspector-app`. Neither is on `main`, and the Inspector's trust-boundary proof is outstanding, so nothing here may assume it exists by 2 December.

## Per check, the same steps

DO the replacement behind its flag, detective, as its own Change; read the run evidence; the Owner's go; WIRE installs it; the ruleset swaps the required context on the Owner's go; the old workflow is deleted and the ratchet falls by one. Nothing is required before its evidence exists. If a check has none by 2 December, the Owner decides on dropping it, and a drop is its own listed step.

## Not in this Change

No replacement is built here, no WIRE, flag, required check or ruleset change. The live rulesets are read, not assumed, before the first swap. Whether `approve Sync` and `review Sync` keep working is not decided here.

## Cases

The existing target Case release/T1123 (held RED until the count is 0) is this Change's measure. Each replacement's own Change carries its Cases.
