---
id: release/RT8
format: 4L
reflects: [release/C116]
---
Account of: I am the release thread. I took the Dispatcher from reading the body of the merged ACT to reading the collector's tree (C116): the PLAN pull request, the SYNC that brought the verify judge in, and the DO with its source and Cases. This is my account only: the CPO and the Owner have not been asked what they lacked, and I wrote the retro of my own collector.

## Liked
- subject: a Case that builds a real collector tree on disk and a real git history, and runs the whole decision from the checkout
  keeps: release/T1330 reads the changed paths of a squash and refuses a merge of two parents, then decides from a checkout the way the workflow does; the Cases on the title and the body change the tree and not the prose, so they judge what the decision is made of.

## Learned
- subject: six older Cases read the body of a KAAL ACT to decide, so moving the decision to the tree needed an accept list
  source: the full Cases run after the source change, which showed T944, T1152, T1153, T1154, T1155 and T1158 red; each was read and changed for the part that moved, and the HOTFIX and WIRE assertions were left as they were.
- subject: a code scanner finding on a Case was real, a replacement of a string with itself
  source: the review comment of the scanner on T1329, which I traced to the line and fixed in a second push.

## Lacked
- subject: the DO needed a judge that was on another collector and on main only after its PROMOTION
  decision-point: starting the DO of this Change, which asks verify Act.
  cost: the DO waited for PROMOTION #2197 and a SYNC (#2210) before it could be built.
  findable: no
  address: AGENTS.md
- subject: the PLAN named the Case ids T1322 onward in words, and the Defect route took T1322 and T1323 by hand
  decision-point: choosing the ids of the Cases in the PLAN.
  cost: the DO read the ids as the next free ones, T1324 to T1330, and told two threads.
  findable: yes
  address: script

## Longed For
- subject: a run of the Dispatcher on a real collector before the WIRE, from the ACT that merged to the draft PROMOTION
  worked-anyway: the Cases cover the decision and the git read on built trees; the first real collector will show what they could not.

Decisions: none made, the owner decides.
