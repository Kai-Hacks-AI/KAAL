---
id: architecture/RT1
format: 4L
reflects: [architecture/C17]
---
Account of: I am the coding agent of the Architecture thread. I drafted and reworked the architecture/C17 PLAN (#2146) through several CPO corrections and wrote its DO (#2459), including the wording alignment to the Finding rule; the CPO steered the model and the Owner decides, and this is my own account.

## Liked
- subject: reusing `addresses` for a Defect, with the observation boundary of the record mechanics
  keeps: the DO stayed one regex letter and one derived lookup in a pure library, with no new field, file or dependency, so a Defect is placed the way a Requirement is solved.
- subject: Cases written red in the PLAN and moved beside their Requirement in the DO
  keeps: the DO was mechanical, because T27 to T29 already said what had to change, and the red and green state could be shown without a job.

## Learned
- subject: no outside source was consulted
  searched: I did not search outside this repository for how other architecture practice places the correction of a defect, so I claim no outside knowledge here.

## Lacked
- subject: one stated model of Found, Born, Placed, Fixed and CARE, and of what a validated Finding is
  decision-point: wording F18 and the Born row of C17 while the model was still being decided in the Defect PLAN (#2113).
  cost: the PLAN was reworked at least three times (special placement fields dropped, a four-stage lifecycle turned into two dimensions, "accepted Defect" removed), and the merged PLAN still said a validated finding yields a Defect, which the DO had to correct afterwards.
  findable: no
  address: Skill
- subject: how far the collector was behind main before I opened the PLAN and the DO
  decision-point: opening #2146 and #2459 on `kaal/architecture/defect-placement`, which was 51 commits behind main.
  cost: every verify Stages job and the Windows Acceptance test failed on both pull requests for a cause that was not mine, a log reading for each, two explaining comments and a SYNC request to another thread.
  findable: yes
  address: script

## Longed For
None raised.

Decisions: none made, the owner decides.
