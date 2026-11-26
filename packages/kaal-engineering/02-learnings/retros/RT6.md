---
id: engineering/RT6
format: 4L
reflects: [engineering/C32]
---
Account of: I am the Engineering worker. I planned and raised the PLAN (#2346) and the DO (#2382) of C32 (the CodeQL gate: the workflow source with its gate jobs), after controls' and release's notes and the CPO's decisions on the threshold and the wait. This is my account only: I have not asked the Owner, the CPO, controls or release what they lacked.

## Liked
- subject: controls' five review points arriving in one note before the PLAN was approved
  keeps: each was concrete (verdict from `judge-mode`, which sha and ref per trigger, a skipped required job counts as success, the brittle regex in T1394) and I could fold all five into one push, so the PLAN was approved with no second round on them.
- subject: the CPO answering the threshold with the live ruleset values and a bounded wait
  keeps: I could not read the ruleset; the answer named both dimensions (`high_or_higher` and `errors`) and the wait (30 seconds, up to 10 minutes) as facts, so the DO declared them and pinned them in a Case, with nothing guessed.

## Learned
- subject: the PLAN pinned one job and the neighbour's shape then changed
  searched: release's note of 23 Nov; on the CPO's direction the judge became two commands and two controls (CTL34, CTL35), so `verify CodeQL` became two jobs and F93, T1393 and T1394 had to be amended in the DO and T1412 added.
- subject: a Case over a workflow can only check text, so it must say which format it found missing
  searched: engineering ships no YAML parser; T1393 and T1394 read the file with line patterns, so F93 pins the writing (a one-line matrix list, one quoted declaration) and the Cases name what they did not find. I checked by hand that T1412 and T1393 go RED on a skipping condition and on another `judge-mode` mode.

## Lacked
- subject: the neighbour's shape before the job names were pinned
  decision-point: writing T1393 in the PLAN, when controls had handed over the check shape and release had not yet planned the judge.
  cost: one amendment of a merged PLAN's requirement and two Cases in the DO; no wasted code, one extra review point for the CPO.
  findable: no
  address: Skill
- subject: a way to see the job run before the review
  decision-point: opening the DO with a source that has never been installed or run.
  cost: the Cases prove the text of the jobs; whether the judge step and `judge-mode` run and fail closed on a real pull request is not yet seen, and stays so until the release WIRE.
  findable: no
  address: script
- subject: a check that the judge and `judge-mode` paths in the workflow exist on `main`
  decision-point: writing T1412 on a collector that does not have release's files until its SYNC.
  cost: I checked the paths on `main` by hand at the DO; no Case does, because a Case cannot be GREEN on the collector for files it does not hold.
  findable: no
  address: script

## Longed For
- subject: the jobs taking the judge from the base ref
  worked-anyway: the DO records it as a known gap (a pull request that edits the judge runs its own version), which the CPO wants resolved before the checks are required.
- subject: one run of the two jobs on a real pull request
  worked-anyway: nothing is installed yet; the release WIRE (Owner's go given) comes after this collector reaches `main`.

Decisions: none made, the owner decides.
