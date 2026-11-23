---
id: engineering/RT5
format: 4L
reflects: [engineering/C31]
---
Account of: I am the Engineering worker. I planned, built and raised the PLAN (#2329) and the DO (#2338) of C31 (the `review-items` folder in the layout), asked for by review's C5, and changed the PLAN three times after the CPO's review. This is my account only: I have not asked the Owner, the CPO or the review thread what they lacked.

## Liked
- subject: the layout check being data-driven (the template names the folders, the check reads it)
  keeps: the DO was a template edit, one document section and two amended Cases; the check did not change, so the change was small and the first Case run showed exactly which folders were missing.
- subject: the CPO's review comments stating the Owner's principle in one sentence ("Review works like Test for placement")
  keeps: the third revision was a single rewrite of one rule, not a search for what was wanted.

## Learned
- subject: a closed folder in the template needs the new child named, or the check flags it
  searched: `check-layout.mjs` and T1392 on the collector; `13-source` and `14-operations` are closed, so a `review-items` inside them was faulted until the template listed it.
- subject: older Cases pin exact child lists
  searched: T1223 (`13-source`) and T1242 (`14-operations`) went RED with the template edit and were amended in the DO.

## Lacked
- subject: the placement rule, stated as a principle
  decision-point: choosing which folders get `review-items`, from review's A2 ("beside their subject, the way a Case sits in `test-cases`").
  cost: I read "subject" as the element folders only and left out source and controls; the CPO sent it back, and the PLAN was pushed three times (placement, then retention wording twice).
  findable: yes
  address: Skill
- subject: the review thread's answer on the folder name and placement
  decision-point: before writing the PLAN.
  cost: I wrote to review and did not wait for the answer; the Owner's rule reached me through the CPO instead, so the reply was never needed, but I could not tell.
  findable: no
  address: Skill
- subject: a guard against pushing a PLAN commit to a collector branch
  decision-point: the first push of the PLAN.
  cost: I pushed the PLAN commit to `kaal/engineering/review-items` and the ruleset would not let me undo it; I made the real collector under another name, and Kai has a stray branch to delete.
  findable: yes
  address: script

## Longed For
- subject: review's own Cases that count a Review item as in spec against the template
  worked-anyway: T1391 and T1392 show the folder in the template and the check passing; review's T1388 to T1390 are theirs and were provisional.

Decisions: none made, the owner decides.
