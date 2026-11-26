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
- **`approve Sync` and `review Sync` wait on the KAAL Approver App (the Owner's ruling: an App).** They hold a token that a plain `pull_request` run does not have. The Owner ruled that an App, not a person or a bot account, is the answer. The Inspector (release/C102) signs checks and never approves, so the approval is a separate third App, KAAL Approver (the Owner's name, for now), with its own key (release/C102 records the split: Inspector, Dispatcher, KAAL Approver). `verify Sync` itself moves to plain `pull_request` in release/C152 and does not wait.
- **Check 4 (Promotion Source) waits on three things:** the Inspector App, the host adapter that supplies trustworthy bytes of the source and the preimage from `main` (Hosting), and the CTO's trust-boundary proof. By the ownership cut proposed to the Owner, Release owns the Promotion Source control and Hosting owns the adapter; this is not settled until the Owner rules.
- **Status, read at this time:** release/C133 (required workflows run from the ruleset's ref) has its revised PLAN (#2494) merged into `kaal/release/delivery-ruleset-gates` and authorizes no DO, WIRE, ruleset change or flag. release/C102 (the Inspector App) is a PLAN under CPO review on `kaal/release/inspector-app`. None of the three Apps exists yet and the Inspector's trust-boundary proof is outstanding, so nothing here may assume them by 2 December.

## Who owns which App (the Owner's ruling)

- **KAAL Inspector** (signs checks) and **KAAL Approver** (approves) are owned by **review**. C102 is handed over to the review thread.
- **KAAL Dispatcher** (raises pull requests) stays with **release**. It raises PROMOTIONs today and may later dispatch other pull request types, so release does not hard-wire it to PROMOTION only.
- **Hosting** owns the GitHub App adapter for all three: manifests, token minting, API calls and the logo slots. Release and review consume it and do not carry their own App plumbing.
- This Change depends on the Approver (owned by review) for `approve Sync` and `review Sync`, and on the Inspector for check 4; Release asks, Review delivers.

## Per check, the same steps

DO the replacement behind its flag, detective, as its own Change; read the run evidence; the Owner's go; WIRE installs it; the ruleset swaps the required context on the Owner's go; the old workflow is deleted and the ratchet falls by one. Nothing is required before its evidence exists. If a check has none by 2 December, the Owner decides on dropping it, and a drop is its own listed step.

## Not in this Change

No replacement is built here, no WIRE, flag, required check or ruleset change. The live rulesets are read, not assumed, before the first swap. Whether `approve Sync` and `review Sync` keep working is not decided here.

## Cases

The existing target Case release/T1123 (held RED until the count is 0) is this Change's measure. Each replacement's own Change carries its Cases.
