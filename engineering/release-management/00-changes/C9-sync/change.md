# C9 change

## PLAN

1. Add I8, F14 and A34 with their Cases T110 to T115, a worked body for F14, the template text `03-architecture/A34-sync-template/sync-template.md`, and C9 with its Cases T118 to T120, one per gap.
2. The expected RED is observed against `main` (`evidence.md`).
3. The SYNC template has two chapters, Change and Reason, as F14 states. The CPO directed the driver and the reason; the evidence confirms them (`evidence.md`) and adds two refinements. The Change line is the identity of the driving Change and nothing more, and a decision the synchronization takes itself at a conflict is stated in Reason, not in a chapter of its own. Source and target are not chapters: Git and the pull request hold them. The body states what a reviewer cannot read elsewhere and nothing the diff, the checks or `branching.md` already show.
4. The PLAN delivers no template, no checker and no enforcement, changes no rule of Branching, and cites no document that is not on `main`.

## DO

1. Add `sync-template.md` with the two chapters of F14, and rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs`. They are green with the text and need nothing outside this collector. Wiring them where the other release management Cases run is not part of this Change.

## Split (12 Nov amendment, CPO review of the promotion)

A capability lands first and its wiring into the host lands after, as a separate Change with its own PLAN and collector, so that no Case is weakened to go green.

- release/C9 (this Change, collector `kaal/release/sync`): I8, F14, A34 with `sync-template.md`, G35 to G37 and the Cases T110 to T115 and T118 to T120. Nothing here depends on the wiring.
- release/C16 (`wire sync template`, collector `kaal/release/wire-sync`): the deployment target A37, the installed `.github/PULL_REQUEST_TEMPLATE/sync.md`, G48 and its own Cases T116, T117 and T121. It comes after this Change is delivered and verifies its installation against the fixed text of this Change.

The first version of this PLAN read the installed `.github` file in T112 to T114, T119 and T120, which made this Change complete only after the wiring. That dependency is removed: A37, T116 and T117 leave this collector, and the template that was delivered into `kaal/release/wire-sync` by #1443 is the DO that C16 verifies.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it. The first SYNC pull request written from the template shows what to adjust, through a new Change.

## Not in this Change

- Hooks, workflows, required checks, ruleset changes, a checker of SYNC bodies and any other enforcement. Checking a body and admitting a pull request are separate concerns.
- The comments on a SYNC pull request, and the subject of its merge commit. The title is the standing convention `SYNC: <meaningful description>`, which F14 states and which this Change does not define.
- The merge method, the procedure and the verdicts of `branching.md`.
- The open synchronizations #1429 and #1430. They keep their bodies and are judged as they are; no template that does not exist is imposed on them.

## Dependencies

create Plan (release/C3) owns the PLAN template and do template (release/C7) the DO template. This Change reuses neither their headings nor their body contracts and does not change them. The promotion and hotfix templates are parallel Changes with their own ids and files.
