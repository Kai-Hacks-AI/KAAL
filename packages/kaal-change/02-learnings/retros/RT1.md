---
id: change/RT1
format: 4L
reflects: [change/C13]
---
Account of: I am the change thread. I planned and delivered change/C13, the Impact and adoption section of the `kaal-change` Skill, as a PLAN and then a DO into `kaal/change/impact`. This is my account only: the CPO and the Owner have not been asked what they lacked, and I wrote the retro of my own collector.

## Liked
- subject: the KAAL-agnostic constraint became a Case
  keeps: T1365 fails if the section names KAAL's delivery terms or assumes a repository, so the constraint stays true through the wording and not through a promise.
- subject: the review loop kept the Change small
  keeps: the PLAN was approved once with its wording as the thing to judge, the DO delivered that wording unchanged, and every approval named an exact head.

## Learned
- subject: Case ids are repo-wide and the other ids are scoped
  source: my first scan covered only `packages/kaal-change` and picked T1129 to T1134, which Release already held; Release's confirmation and a rescan of every branch gave T1361 onward.
- subject: a fixed Case count is a defect
  source: CI found two acceptance Cases that hard-coded ten verified Cases; the new Cases made it sixteen. They now assert that every Case the installed package declares verifies.
- subject: Cases belong beside the element they observe
  source: the PLAN kept them in the Change folder as RED Cases and the DO moved them into the Skill's own embedded Cases, so the folder keeps none.

## Lacked
- subject: one view of the next free id of each kind across every branch
  decision-point: choosing Case ids before the PLAN.
  cost: one renumbering after the clash with Release.
  findable: no
  address: script
- subject: a way to run the packed acceptance Cases before pushing
  decision-point: adding Cases to the Skill, which changes what the packed install must verify.
  cost: two CI failures found after the PR was open.
  findable: no
  address: script
- subject: a list of which words belong to the Skill and which to KAAL's own practice
  decision-point: wording "available, integrated, active".
  cost: judged by my own reading instead of checked.
  findable: no
  address: reference

## Longed For
- subject: evidence that the questions help in practice
  worked-anyway: the CPO approved the PLAN noting it does not establish measurement of adoption; this collector claims only that the guide asks the questions and keeps KAAL's vocabulary out. A real Change planned with the section, and a reader saying whether it changed a decision, would show whether one line is enough for a small Change.

Decisions: none made, the owner decides.
