# C6 change

## PLAN

1. Add I5, F10, A29 and A30 with their Cases T91 to T94, and C6 with its own Cases T95 to T97, one per gap.
2. The expected RED is observed against `main` (`evidence.md`).
3. The ACT template is shorter than the PLAN template and has two chapters, Change and Records, as F10 states. The 4L retrospective is the one element named so far. No other element of ACT is defined, and no follow-up or lifecycle obligation is added.
4. The PLAN delivers no template, no checker and no enforcement, and it cites no document that is not on `main`.

## DO

1. Deliver `.github/PULL_REQUEST_TEMPLATE/act.md` with the two chapters of F10, as its own `.github` change on its own collector, because Change Isolation keeps `.github` apart from engineering.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green, and wire them where the other release management Cases run.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it. The first ACT pull request written from the template shows what to adjust, through a new Change.

## Dependencies

create Plan (release/C3) owns the PLAN template and its body contract. This Change reuses neither and does not change them. Testing owns Case design.
