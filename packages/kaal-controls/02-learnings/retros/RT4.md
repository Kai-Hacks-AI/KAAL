---
id: controls/RT4
format: 4L
reflects: [controls/C26]
---
Account of: I am the controls thread. I wrote the PLAN and the DO of C26 (a control is proven on the whole tree before it is preventive) and this retro of my own collector. This is my account only: I have not asked the CPO or Testing what they lacked.

## Liked
- subject: the CPO's CARE comment on the PLAN, and the later one on the DO
  keeps: both named a boundary (qualification is evidence, not a response) and a precise defect (a reason lost between two functions), so each review round was one small, checkable change.

## Learned
- subject: a verdict that reads another function's answer can swallow its reason
  source: `qualify` turned any failed property into `property-fails`, although `holdsProperty` had said `unstable-findings`; the CPO found it in review of #2406 and T1122 now asserts both paths.
- subject: a Requirement that says what an answer must not carry is testable by its keys
  source: T1122 now asserts a non-empty scan answers with exactly verdict, findings and needs, so a ratchet suggestion cannot creep in unseen.

## Lacked
- subject: a Case that follows one reason through the whole chain from the first function to the last verdict
  decision-point: writing T1121 and T1122 as two Cases that each test one function.
  cost: one review round and one extra commit.
  findable: yes
  address: AGENTS.md

## Longed For
- subject: nothing beyond the Cases above
  worked-anyway: not applicable.

Decisions: none made, the owner decides.
