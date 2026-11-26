---
id: engineering/RT8
format: 4L
reflects: [engineering/C33]
---
Account of: I am the Engineering worker. I planned and raised the PLAN (#2387), the SYNC (#2395) and the DO (#2396) of C33 (the CodeQL gate judges run from the default branch), asked for as the follow-up that closes the self-judging gap of C32. This is my account only: I have not asked the Owner, the CPO or release what they lacked.

## Liked
- subject: the CPO naming the gap as its own step
  keeps: C33 stayed one edit (a `ref:` on two checkouts) with two Cases, so the DO was small enough to review at a glance and C32 was not reopened.
- subject: sharing the F93 fixture between F94's Cases
  keeps: T1413 and T1414 read the gate jobs with the helper C32 already pinned, so a change to the job shape breaks one place.

## Learned
- subject: a collector cut before a promotion cannot see the file its DO edits
  searched: the C33 collector was cut before C32 reached `main`, so `codeql.yml` was not there; the SYNC had to land first, and `verify Sync` failed with `no-reason` until the PR body had a `## Reason` chapter. The chapter belongs in the body, not the commit message.
- subject: the default-branch checkout fixes who is judged, not who edits the workflow
  searched: a pull request can still edit `codeql.yml` itself; the DO records this as the residual that the Inspector (controls C14) closes.

## Lacked
- subject: any way to run the job before the WIRE
  decision-point: opening the DO with a workflow that has never run.
  cost: the Cases prove the text of the checkout, not that `github.event.repository.default_branch` resolves on every event a gate runs on (`pull_request`, `merge_group`); that is unseen until release's WIRE.
  findable: no
  address: script
- subject: a rule for when a SYNC is needed before a DO
  decision-point: cutting a collector at `main`'s tip while a promotion it depends on was still pending.
  cost: one extra PR (#2395) and one failed check.
  findable: yes
  address: Skill

## Longed For
- subject: a run of the installed gate on a real pull request that edits the judge
  worked-anyway: T1413 and T1414 pin the text; the CPO lists installed evidence as a prerequisite for activation.
- subject: workflow integrity enforced by a control
  worked-anyway: named as a prerequisite by the CPO; nothing here makes the checks required.

Decisions: none made, the owner decides.
