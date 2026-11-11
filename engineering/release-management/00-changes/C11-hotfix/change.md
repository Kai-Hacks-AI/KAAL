# C11 change

## PLAN

1. Add I10, F16, A36 and A39 with their Cases T150 to T157, and C11 with its own Cases T158 to T160, one per gap.
2. The expected RED is observed against `main` (`evidence.md`).
3. The Hotfix template has five chapters, Change, Defect, Correction, Route and Recovery, as F16 states. `interface.md` derives them from the purpose of a Hotfix and from the observed pull requests, and says what is left out and why. The body states intent only. It repeats no PLAN, DO or ACT heading except Change.
4. The PLAN states the relationship between this interface and the future Hotfix delivery path (`interface.md`) and implements none of that path.
5. The PLAN delivers no template, no checker and no enforcement, adds no hook, workflow, required check or ruleset, changes no branching rule, and cites no document that is not on `main`.

## DO

1. Deliver `.github/PULL_REQUEST_TEMPLATE/hotfix.md` with the five chapters of F16, as its own `.github` change on its own collector, because Change Isolation keeps `.github` apart from engineering.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green, and wire them where the other release management Cases run.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it. The first Hotfix pull request written from the template shows what to adjust, through a new Change.

## Dependencies

create Plan (release/C3), the DO template (release/C7) and the ACT template (release/C6) own their own templates. This Change reuses none of their headings but Change and changes none of them. The Hotfix delivery path (branch lifecycle and differentiated controls) is a later Change with its own authorization. create Promotion and create Sync are parallel Changes: the promotion of the hotfix collector and the synchronization of `main` into collectors are theirs, and Route here only names them. Testing owns Case design.
