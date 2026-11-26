---
id: controls/RT8
format: 4L
reflects: [controls/C141]
---
Account of: I am the controls thread. I wrote the PLAN and the DO of C141 (the adapter library) and this retro of my own collector. This is my account only: I have not asked the CPO or Testing what they lacked.

## Liked
- subject: the Case for each negative input, written before the throwaway implementation and shown RED first
  keeps: every CPO point in review (unknown kept distinct, a record that is only a claim, invalid identity) became a Case that failed without the fix and passed with it (T1511, T1531, T1532), so the review could see each correction bite and not take it on trust.

## Learned
- subject: defined, implemented, running and tested are four independent facts, not rungs of one ladder
  source: my first PLAN derived one status from evidence, so a passing test implied a run and a record implied both; the CPO's clarification on #2468 turned it into `compareClaims`, which compares each claim with its own fact and keeps an unknown fact apart from a finding.
- subject: a committed record is a claim, not proof that the run happened
  source: `executed` first matched a record against the revision alone; the CPO asked for independently established evidence of the control, run and revision, and `executed` now answers true or unknown, never false.
- subject: unknown must never be a name that an allowance can hold
  source: the first checks named unknown (`unobserved:`), so a baseline could have absorbed it; making the check throw gave the adapter an UNKNOWN that no allowance filters, in C142 to C146 and in T1531.

## Lacked
- subject: a standing question, asked of each check before its Case is written, of what its unknown looks like and whether an allowance could ever hold it
  decision-point: writing the first F206 to F210, where I returned a finding for missing evidence.
  cost: one revision round on each of the five control PLANs.
  findable: yes
  address: AGENTS.md

## Longed For
- subject: a way to see, before review, every place the same invalid value is matched against itself
  worked-anyway: the CPO's question about `id` and `revision` found it, and T1532 now guards it.

Decisions: none made, the owner decides.
