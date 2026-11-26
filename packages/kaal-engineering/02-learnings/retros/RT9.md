---
id: engineering/RT9
format: 4L
reflects: [engineering/C35]
---
Account of: I am the Engineering worker. I planned and raised the PLAN (#2417) and the DO (#2429) of C35 (`verify Workflow names` runs the judge of the default branch), asked for by release as the engineering half of their C132. This is my account only: I have not asked the Owner, the CPO or release what they lacked.

## Liked
- subject: C33 as a pattern, and release's C132 PLAN to align with
  keeps: the default-branch checkout, with the pull request read only as Git data, was already decided and reviewed, so the PLAN was one page and the CPO approved it as aligned with C132 without a question of its own.
- subject: the small fallback rule for a base without a baseline
  keeps: taking the default branch's file, and saying so in the step's output, answers the stale-collector case without letting a head widen the allowance.

## Learned
- subject: moving the trusted source of a check moves what its older Cases pinned
  searched: T1416 pinned the base checkout and T1417 pinned the `--previous` path, so both had to be narrowed in the DO. I wrote each pinned fact in one Case only (T1423 for the checkout), and F95.md now says what was moved.
- subject: a base that cannot be fetched or a default branch with no baseline
  searched: `cp` of the default branch's baseline would have failed with exit 1 and not 2; I made it exit 2 so an absent baseline is UNKNOWN and never reads as a pass.

## Lacked
- subject: any way to run the job on a stale-collector SYNC before the WIRE
  decision-point: opening the DO with a workflow that has never run on the case it is for.
  cost: the Cases pin the text of the steps; whether `git fetch origin "$BASE_SHA"` works without credentials on the runner, and what `git show` returns for a base that predates the control, is unseen until release's WIRE. The CPO records the same limit.
  findable: no
  address: script
- subject: one place that says which checks judge from the default branch and which from the base
  decision-point: C33 (CodeQL), C35 (workflow names) and release's C132 (triggers) each decided it separately.
  cost: three Changes for one rule, found by a failing SYNC and not by a review.
  findable: yes
  address: Skill

## Longed For
- subject: a run of the installed check on a real SYNC into a stale collector
  worked-anyway: the DO states it as not yet observed; the WIRE is release's and needs Kai's go.
- subject: the Inspector closing the workflow-edit gap
  worked-anyway: the residual of C33 holds and is named in the PLAN.

Decisions: none made, the owner decides.
