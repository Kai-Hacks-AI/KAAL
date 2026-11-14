# C27 change

## PLAN

1. Add F22 and A47, the gap G61, the draft of the WIRE template and two Cases, both RED on `main`: T209 judges the template draft and that it is installed, T210 judges an install (source, target, byte equality, nothing else changed), shown on known good and bad installs before it judges the real tree.
2. The PLAN installs nothing, activates no ruleset, promotes nothing and changes no existing delivery contract.

## Relation to PROMOTION and HOTFIX

PROMOTION moves a qualified collector to `main`. HOTFIX is the urgent path for a Defect. WIRE installs an artifact that is already on `main` into `.githooks/` or `.github/`. Only PROMOTION, HOTFIX and WIRE reach `main` from a collector; none of them is a PDCA cycle. A WIRE uses the promotion seat, so there is one at a time.

## What WIRE checks and what the collector qualifies

- Collector (PDCA, before PROMOTION): the source of the control, judged by isolated executable Cases, and the ACT.
- WIRE: installed equals source byte for byte, the legacy file moved unchanged, nothing else changed, and the operational acceptance of the target (for hooks, Guard acceptance on the installed tree).

An installation-dependent Case therefore has a second home: the collector holds the Case that judges the source, and WIRE holds the Case that judges the install. No second PDCA.

## Revised sequence for release/C26

1. Engineering collector: the dispatcher becomes a source `05-src/wiring/hooks/pre-push-dispatcher`, and T206 judges it in isolation (legacy preserved, arguments and refs forwarded, failures aggregated, fail-closed), together with #1645 (Guard acceptance T5, already in the collector). The final ACT is written once that is green, and the collector is promoted.
2. WIRE: #1646 becomes the WIRE pull request. Its diff does not grow: the move of the legacy hook, the dispatcher and the README. T207 (legacy bytes unchanged) and T208 (the directory holds only unchanged copies) are the WIRE verification, with Guard acceptance on the installed tree. A source-equals-target Case for the dispatcher is added to the same set.
3. The provisional ACT #1649 is closed unmerged.

## `.github` installs

C18's workflows and ruleset JSON follow the same path: sources through the Engineering collector, then WIRE for `.github`. T204 (installed equals source) is the WIRE verification of C18. Installing the ruleset into GitHub is not a WIRE of files and needs the Owner's go.

## DO

1. The template `wire.md` travels alone in a `.github` collector, unchanged from the draft in `interface.md`. T209 and T210 are then renamed to `.test.mjs`. The title type, Branching and merge-method classification are a separate DO that needs review and the Owner's authorization.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`. It lands in the collector before the promotion.

## Not in this Change

A WIRE workflow engine, a registry of installs, the title type and Branching rules, any ruleset activation, and promoting or editing release/C26 or release/C18.
