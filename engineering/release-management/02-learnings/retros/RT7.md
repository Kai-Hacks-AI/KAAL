---
id: release/RT7
format: 4L
reflects: [release/C117]
---
Account of: I am the release thread. I moved the merge queue of Promotion into the source of the `promoting` ruleset (C117): the PLAN pull request with its Intent, its control and its Case, after the id and evidence corrections below. This is my account only: the CPO and the Owner have not been asked what they lacked, and I wrote the retro of my own collector.

## Liked
- subject: one Case that reads the ruleset source and the stages declaration together
  keeps: release/T1321 judges the queue's parameters in the ruleset source against the control's declaration, so the two cannot drift apart, and it names the property it protects instead of pinning wording.

## Learned
- subject: moving a rule into a ruleset source changes what older Cases assume about the whole set
  source: the Engineering check on the first push, where T481, T482, T483, T511, T512, T1132 and T1133 failed because they pinned the set of rules without a queue; read from the job log, and fixed in the accept list of this Change.

## Lacked
- subject: nothing told me what a preventive control's evidence must look like before the checker refused it
  decision-point: writing the evidence line of the control CTL32.
  cost: two failing Engineering runs and two pushes: the finder wanted a `:fail` entry, then T1095 wanted two real runs.
  findable: no
  address: Skill
- subject: the Change id I took was already allocated in flight by another thread
  decision-point: choosing the id of the Change.
  cost: a rename of the Change and its folder and a second push (C115 became C117).
  findable: yes
  address: script

## Longed For
- subject: a way to run the whole Engineering check on a branch before pushing it
  worked-anyway: I ran single Cases and read the failing job log; it cost a push per finding.

Decisions: none made, the owner decides.
