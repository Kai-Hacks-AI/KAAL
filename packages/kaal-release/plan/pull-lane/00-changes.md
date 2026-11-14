# Pull Promotion: pull the promotion lane instead of pushing it (Change A to B)

This is `pull/C10`, a PLAN Change. It ships no code, installs nothing and changes no ruleset. It answers the Owner's question of 14 Nov 2026: how would a pull design of the promotion lane look, with auto-approval possibly later. It authorizes preparation, not promotion or publication.

## A: the present

People and threads push the lane by hand. Someone decides which collector goes next, someone opens the SYNC, someone opens the PROMOTION, and a SYNC can be opened before its collector holds the seat. Pull Promotion reports facts (`qualifiers`, `next`) but nothing acts on them.

## B: the target

One rule, pulled from the report. The lane has a seat (promotion WIP 1). A PROMOTION landing on `main` frees the seat, and that is the only trigger. Then:

1. **Pull.** The freed seat pulls `next` (highest value density, pull/C9) and opens that collector's PROMOTION PR. If `next` is judged (no single collector), nothing is opened; the Owner chooses.
2. **Sync on demand.** Only the seat holder, and only when its PROMOTION is behind `main`, gets a SYNC PR. No speculative syncs for collectors without the seat.
3. **Re-qualify.** At the new exact head the Script reports the holder again. PASS: the PROMOTION is ready for the CPO. FAIL: the seat is released and the remaining qualifiers are ranked by the same pull/C9 rule (the Script's `chooseNext`, not a second algorithm), the failed one excluded; if they are tied or incomparable the Owner judges, and if none remain the lane waits. UNKNOWN never passes and holds the seat.
4. **Land.** The merge queue squashes, the seat frees, and the cycle repeats.

The step is a pure function of facts: `laneStep(state)` returns one advisory action (`wait`, `judge`, `open-promotion`, `open-sync`, `ready-for-cpo`) and never an approval, a merge or a ruleset change.

## It cannot spam PRs

Before any wiring it must be proven that the lane cannot flood the repository. The rule (pull/F42) is checked on the state it is given: an open PR of the same type for the same collector means wait, never a second; at most one PROMOTION and one SYNC are open lane-wide; a PR closed under the same trigger is not re-opened without a new trigger; an attempt cap, reached, goes to `judge`; and a missing or invalid input goes to `judge`, never to an open. Wiring (a workflow plus App) is a later Change and starts only after this is on `main`.

## What it reuses

Nothing new is invented. The lane reads what exists:

- **Pull Promotion** supplies the facts: `qualifiers`, the exact-head re-qualification, and `next` by value density (pull/C9). `laneStep` consumes that report and adds no second qualification.
- **The existing PR templates** shape the PRs it opens: a SYNC with the chapters Change and Reason, a PROMOTION with Change and Why now, titled `<TYPE>: <description>`, with the Change id in the body and the envelope cue the templates carry. There is no new template, no template registry and no new PR type.
- **The existing rules** stay: one seat, SYNC only for the holder, the merge queue squashes, the CPO approves.

## Identity (a later slice, not this PLAN)

A PR opened with `GITHUB_TOKEN` does not trigger other workflows, so the checks a PROMOTION needs would not run. Opening the PRs needs a GitHub App identity with narrowly scoped permissions (open PRs, no merge, no approve, no admin). Installing it is Owner-gated and happens only once `laneStep` is on `main`, per the sequencing rule: wiring starts when its ingredients are on `main`.

## Auto-approval (a later, separately gated slice)

Auto-approval is a governance change, not a convenience. It is out of scope here. If ever proposed, it needs its own PLAN and the Owner's go, and it never bypasses the CPO review or a required check. This PLAN keeps approval a human act: `laneStep` has no approve action.

## Not in this Change

No workflow, App, ruleset, hook or declaration change. No value or size is assigned. `next` stays advisory.

## Order

PLAN (this), then DO (`laneStep` in the Script, README, T40 and T41 to green), then ACT, a concluding collector-level ACT, SYNC and PROMOTION. Collector: `kaal/release/pull-lane`, from `main`. The wiring (workflow plus App) is a separate later collector, `kaal/release/wire-pull-lane`.
