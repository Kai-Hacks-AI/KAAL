# C7 change

## PLAN

1. Add I6, F11, A31 and A32 with their Cases T98 to T101, and C7 with its own Cases T102 to T104, one per gap.
2. The expected RED is observed against `main` (`evidence.md`).
3. The DO template has three chapters, Change, Implement and Refactor, as F11 states. It reuses no heading of the PLAN template. The body states intent only: no test results, CI status, execution logs or narrative of the red-to-green steps.
4. The PLAN delivers no template, no checker and no enforcement, redesigns no TDD, CI, Change artifact or verification control, and cites no document that is not on `main`.

## DO

1. Deliver `.github/PULL_REQUEST_TEMPLATE/do.md` with the three chapters of F11, as its own `.github` change on its own collector, because Change Isolation keeps `.github` apart from engineering.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green, and wire them where the other release management Cases run.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it. The first DO pull request written from the template shows what to adjust, through a new Change.

## Dependencies

create Plan (release/C3) owns the PLAN template. This Change reuses neither its headings nor its body contract and does not change them. The act template (release/C6) is a parallel Change with its own template file. Testing owns Case design.
