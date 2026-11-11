# C9 change

## PLAN

1. Add I8, F14, A34 and A37 with their Cases T110 to T117, a worked body for F14, and C9 with its Cases T118 to T120, one per gap.
2. The expected RED is observed against `main` (`evidence.md`).
3. The SYNC template has two chapters, Change and Reason, as F14 states. The CPO directed the driver and the reason; the evidence confirms them (`evidence.md`) and adds two refinements. The Change line is the identity of the driving Change and nothing more, and a decision the synchronization takes itself at a conflict is stated in Reason, not in a chapter of its own. Source and target are not chapters: Git and the pull request hold them. The body states what a reviewer cannot read elsewhere and nothing the diff, the checks or `branching.md` already show.
4. The PLAN delivers no template, no checker and no enforcement, changes no rule of Branching, and cites no document that is not on `main`.

## DO

1. Deliver `.github/PULL_REQUEST_TEMPLATE/sync.md` with the two chapters of F14, as its own `.github` change on its own collector, because Change Isolation keeps `.github` apart from engineering.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green, and wire them where the other release management Cases run.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it. The first SYNC pull request written from the template shows what to adjust, through a new Change.

## Not in this Change

- Hooks, workflows, required checks, ruleset changes, a checker of SYNC bodies and any other enforcement. Checking a body and admitting a pull request are separate concerns.
- The title of a SYNC pull request and the subject of its merge commit, which differ today (`evidence.md`), and the comments on it.
- The merge method, the procedure and the verdicts of `branching.md`.
- The open synchronizations #1429 and #1430. They keep their bodies and are judged as they are; no template that does not exist is imposed on them.

## Dependencies

create Plan (release/C3) owns the PLAN template and do template (release/C7) the DO template. This Change reuses neither their headings nor their body contracts and does not change them. The promotion and hotfix templates are parallel Changes with their own ids and files.
