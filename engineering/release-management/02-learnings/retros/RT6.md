---
id: release/RT6
format: 4L
reflects: [release/C114]
---
Account of: I am the release thread. I took the Branching first-run Defect from the hotfix track onto a release collector (C114): the PLAN pull request, its rework after two changes of direction, and the Case and the workflow source it carries. This is my account only: the CPO and the Owner have not been asked what they lacked, and I wrote the retro of my own collector.

## Liked
- subject: testing the changed check by running it, with a stub checker in a scratch clone, on both sides of the behaviour
  keeps: the Case runs `branching.sh` with auto-merge off, empty and on, and three mutations (the old script, the guard removed, the concurrency switch turned off) were each caught by a named assertion, not by reading source text.

## Learned
- subject: the Engineering check runs every Case on the collector, so a Case that is RED by its content fails the pull request
  source: the job log of the first version of this pull request: the Cases lane failed on release/T1320 and pull/T34 failed with it, because it asserts that every plain Case is logged as a success; both read directly from the log.

## Lacked
- subject: nothing said how a PLAN carries a Case that is RED until the source exists, while Cases are plain `.test.mjs` and never renamed
  decision-point: placing release/T1320 in the PLAN.
  cost: I went through a `.red.mjs` file, a plain RED Case that failed the Engineering check, and then carried the Case with its source in one pull request, three pushes and a wait on a failing check.
  findable: no
  address: Skill
- subject: nothing recorded what the Branching merge-method gate protects
  decision-point: choosing between fixing the race and retiring the gate.
  cost: I built a version without the gate, which was dropped when it was asked what the gate protects, and read the checker and its documentation to answer.
  findable: no
  address: AGENTS.md

## Longed For
- subject: a phase judge in the Engineering check that excuses a Case that is RED at PLAN
  worked-anyway: carrying the Case and the source together did it; nothing was blocked, but the PLAN and the DO became one pull request.

Decisions: none made, the owner decides.
