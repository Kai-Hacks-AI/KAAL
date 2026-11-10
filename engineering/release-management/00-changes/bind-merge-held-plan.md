# bind Merge: a recovery path in every verdict, and a method not yet knowable is held (PLAN)

PLAN, nothing is built. It answers a finding of Release - 0.0.1 and the Owner's go: the Branching check fails when auto-merge is not yet enabled, and GitHub offers to enable auto-merge only on a pull request that is not already failing, so a pull request passes only by racing the check (disable, then enable auto-merge to get a fresh run). The request is that this case return Guard's `held` outcome and not `fail`.

## Where the issue lives (Intent, Requirements, Architecture, Code)

1. **Intent (I1).** Intact: only an approved, correctly shaped change reaches `main`, and a merge by the wrong method must not happen.
2. **Requirements (F10, bind Merge).** Here. F10 says "the merge method is judged: squash for a Change or promotion, merge commit for a synchronization". It states no verdict for the time before auto-merge is on, when the method is not yet knowable. Today the code makes that state a failure ("Auto-merge is disabled ... Enable auto-merge"), which is not a defect of the pull request but a state it has not left yet. F10 needs the missing clause: **until the pull request names a method, the verdict is held; once it names one, the verdict is pass or fail on the method; and a held merge method never lets the change progress.**
3. **Architecture.** The consequence is in the outcome vocabulary. Guard's `held` makes a CI job succeed with a warning. That is right for the job `bind Merge` (the pull request can then be given auto-merge) and wrong for progression: **the gates (`gate (integration)`, `gate (promotion)`) must read a held bind Merge as not passed.** The gates are the only required contexts in the target architecture, so held is safe there by construction. Today the one required check is Branching itself, which bundles the method verdict with ancestry and shape.
4. **Code.** `lineage.ts` `autoMerge` returns `fail` for `enabled === null`; `branching.sh` maps exit 1 to failure. Exit 4 already exists as `held` for the audit (collectors only) and `Branching.md` already names it (`outcomes: {"4": held}`).

## Recovery is part of the verdict (Owner, 10 Nov)

The Owner's direction: the recovery path belongs to the failing or held CI verdict itself, driven by the JavaScript Cases underneath. A verdict that fails or holds must carry a way out that works. The auto-merge trap is the example: the verdict says "Enable auto-merge" while the interface no longer offers it, so the stated recovery is unreachable.

- **The rule.** Every `fail` and `held` verdict of a release control carries a recovery step that (a) names an action the person or agent can actually take, with the exact means (a command or API call, not only a button), and (b) is *reachable*: performing it makes the check run again, so the verdict can change.
- **Cases first (RED).** On the verdict functions of `lineage.ts` and the other controls, parsed and executed, never by reading names: (1) every `fail` and `held` message of every verdict function carries a recovery step; (2) a recovery step names an event, and the workflow that runs the check lists that event among its triggers (parsed from the workflow YAML), so doing it re-runs the check; (3) for the auto-merge trap: with auto-merge off, the verdict's recovery is `gh pr merge --auto --squash <n>` (or the same through the API), and `lineage-synchronization.yml` runs on the `auto_merge_enabled` event. Today the message only says "Enable auto-merge", and the workflow does re-run on that event, so the path exists but is not stated; Case (3) is RED for the message.
- **Generalizes.** The same two Cases run over every control of the release chain (the verdict functions and the `KAAL / release / <step>` jobs), so a new control cannot ship a failing verdict without a reachable recovery.
- **Interim fix, no change of semantics.** With this, the existing single required Branching check needs no weakening: it keeps failing without auto-merge, but now says how to leave the state (enable auto-merge by API or CLI, which re-runs the check). That removes the race without making the check pass while the method is unknown.

## Design

- **Requirement (F10, a clause) and Case.** The clause above, with Cases on the verdict function: no method yet gives `held`, a wrong method gives `fail`, the right method gives `pass`, and `held` is never converted to `pass` by a consumer.
- **Fits the Branching split.** In `bind Merge` (its own control and job after the split) `autoMerge` returns a `held` verdict for `enabled === null`; the check exits 4; Guard reports held with its warning and the job succeeds. `gate (integration)` and `gate (promotion)` treat `held` from `bind Merge` as failed, fail-closed, so nothing progresses on a held method. Nothing else about the verdict changes.
- **Interim (the single required Branching check, before the split and the gates).** Making the existing check pass on held would let a collector pull request without auto-merge satisfy the only required context, and collectors have no merge queue: a person could merge it by hand with any method. So **the interim is not to change the existing check's semantics**; its message gains the reachable recovery above, and the practice of enabling auto-merge when opening the pull request (the Owner's standing rule) avoids the first-run failure. If the Owner prefers the interim change anyway, the cost is stated: the method verdict is not enforced for a collector pull request merged by hand while held. That choice is the Owner's.
- **Not changed.** `main`'s merge queue judges the method again on the merge group, so a held pull request cannot reach `main` unjudged.

## Sequence

1. This PLAN, CPO review.
2. RED: the recovery Cases (1) to (3) above, the F10 clause as a requirement in the target documents, and Cases on `autoMerge` and on the gate's reading of held.
3. DO, first the recovery text in the verdicts (the interim fix, no change of semantics), then with the Branching split: `bind Merge` returns held and the gates read held as not passed.
4. Remove the race practice only after the split is live and required.

## Open for the Owner and CPO

- Whether to accept the interim risk and change the existing check now, or hold the change for the split (recommended).
- The F10 clause wording.
