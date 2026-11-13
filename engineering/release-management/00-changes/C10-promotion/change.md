# C10 change

## PLAN

1. Add I9, F15, A35 and A38 with their Cases T130 to T133, and C10 with its Cases T134 to T136 (one per gap) and T137 to T139 for F15. The expected RED is observed against `main` (`evidence.md`).
2. The promotion template has two chapters, Change and Why now, as F15 states. Change shares only its name with the PLAN and DO interfaces, because it carries the same stable identity. It carries no source or destination, PLAN, status, approval, merge method or attribution, because the evidence shows each of them written into promotion bodies (`evidence.md`). The CPO's candidate of Change, Value and Priority was tested against that evidence, and `evidence.md` records why Value and Priority became one chapter.
3. The PLAN delivers no template, no checker and no enforcement, changes no workflow, ruleset or required check, redesigns neither Branching nor the promotion queue, and cites no document that is not on `main`.

## DO

1. Deliver `.github/PULL_REQUEST_TEMPLATE/promotion.md` with the two chapters of F15, as its own `.github` change on its own collector, because Change Isolation keeps `.github` apart from engineering.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green, and wire them where the other release management Cases run.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it. The first promotion body written from the template shows what to adjust, through a new Change.

## Not in this Change

- A check of a promotion body (the counterpart of check PR Body), a hook, a workflow, a required check, a ruleset or merge-queue change.
- The merge method of a promotion. It stays a Branching fact and the template states none.
- What happens to promotions that are open now, and the SYNC and Hotfix interfaces. Those are other Changes with their own PLANs.

## Dependencies

create Plan (release/C3) owns the PLAN template, the DO template (release/C7) and the ACT template (release/C6) are parallel Changes, and create Sync and create Hotfix (release/C9, release/C11) are parallel Changes with their own templates. This Change reuses none of their headings and changes none of their files.
