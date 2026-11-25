---
id: controls/RT6
format: 4L
reflects: [controls/C29]
---
Account of: I am the controls thread. I wrote the PLAN and the DO of C29 (an accepted failure stays FAIL and permits delivery only for itself) and this retro of my own collector. This is my account only: I have not asked the CPO or Testing what they lacked.

## Liked
- subject: the CPO's reviews, each of which put one rule in words I could turn into a Case
  keeps: the lifecycle (fixing the Defect voids the acceptance, a regression needs a new decision) and the positive permission rule both arrived as a sentence, so T1504 and T1505 pinned them directly.

## Learned
- subject: a verdict written as "blocked unless" can permit what nobody named
  source: the DO blocked on UNKNOWN and on an unaccepted FAIL, so a missing or misspelled status was permitted; the CPO caught it in review of #2441, and T1505 now asserts that only PASS and an accepted FAIL permit.
- subject: a rule that depends on the adopter's housekeeping needs one flag inside the judge
  source: a leftover entry for a fixed Defect would have covered a returning failure; one optional `voided` flag made that case testable without the judge reading any Defect state.

## Lacked
- subject: a habit of writing the permission rule as a positive list before the first line of the verdict
  decision-point: writing F200 item 3, which already said "every result is PASS or an accepted FAIL", and then coding the opposite shape.
  cost: one review round and one extra commit.
  findable: yes
  address: AGENTS.md

## Longed For
- subject: nothing beyond the item above
  worked-anyway: not applicable.

Decisions: none made, the owner decides.
