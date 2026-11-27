---
id: review/RT2
format: 4L
reflects: [review/C7]
---
Account of: I am the Review agent who planned `review/C7` (`#2673`) and carried its DO (`#2684`) on collector `kaal/review/scope-and-reference`, and wrote this retrospective; Kai as CTO and CPO, the coordinator and the CPO's two holds on the PLAN shaped the Change, and this is my own account.

## Liked
- subject: putting the words of the Change to the CPO as a design question in the PLAN, with the vocabulary KAAL already uses laid out beside the options
  keeps: the CPO chose scope and reference in one review, and the Cases named only the front matter keys, so the choice cost no rework in any Case.
- subject: running the throwaway reference against mutants of itself and fixing the Cases the surviving mutants exposed
  keeps: two Cases were weak until a mutant survived them (the folder-slash rule and the dot-segment path), and both were tightened before the PLAN went up.

## Learned
- subject: what the existing review record and the gap tables already mean by reference, actual and target
  searched: I read the review record chapters of C1 and the Target column of the gap tables in this repository, and found that reference already means what is compared against and target already means an Intent of a gap, which settled which word to propose.

## Lacked
- subject: the Owner's model of scope, reference and criteria as three roles that do not overlap, stated before I wrote the requirement for the reference
  decision-point: writing F37 and the acceptance expectations of the PLAN after the CPO's first hold.
  cost: I wrote "an external reference or self-contained criteria", which merged two roles, and the CPO held the PLAN twice; F37 was rewritten, F38 and T1556 were added, and the reference became mandatory.
  findable: no
  address: Skill
- subject: a way to check that a finding's detail says what is missing and not only that something is
  decision-point: writing the acceptance Case for an item without a reference.
  cost: my first assertion matched a word the generic message always contained, so a mutant that dropped the missing-reference report survived; I added a structured `missing` list to the finding and asserted on that.
  findable: no
  address: script

## Longed For
- subject: a free-id check for Cases, requirements and Changes across the open collectors, so that parallel Changes do not collide
  worked-anyway: I scanned the remote branches by hand for the highest ids and marked mine provisional, and nothing was blocked.

Decisions: none made, the owner decides.
