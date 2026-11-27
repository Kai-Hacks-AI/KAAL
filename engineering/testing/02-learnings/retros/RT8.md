---
id: testing/RT8
format: 4L
reflects: [testing/C83]
---
Account of: I am the coding agent who wrote the testing/C83 PLAN (#2685) and its DO (#2692) on collector kaal/testing/mutation-verification, at Kai's go, and this is my own account.

## Liked
- subject: a throwaway prototype of lib/mutate.mjs and the command before the PLAN was raised
  keeps: it showed that T417 to T419 can go GREEN, so the PLAN's Cases ask for something buildable, and the DO was a copy of known code plus the placed docs; the DO merged on its first CI run.
- subject: answering the vocabulary question with the actual causes of `unresolved` and the terms Stryker and PIT use
  keeps: the CPO kept `unresolved` on that assessment, so the word in the Skill, the Cases and the record stayed one word.
- subject: listing the Cases that pin the package's export list before adding `./mutate`
  keeps: T160 and T369 were updated in the first DO commit, which RT7 had named as the earlier miss.

## Learned
- subject: two collectors that edit the same package files need a SYNC for the second one
  source: the C83 collector branched from main, which does not hold C82, and both add an export to package.json and a line to T160, T369, testing.test.mjs and the README; the CPO named the C82 and C83 SYNC as the CTO's to do.

## Lacked
- subject: a check, when raising a collector, for an unpromoted collector of the same package
  decision-point: branching kaal/testing/mutation-verification from main while kaal/testing/observe-cases-at-revision was still waiting for PROMOTION.
  cost: one SYNC to take before the second collector lands, and the same five files changed in two collectors.
  findable: yes
  address: Skill

## Longed For
- subject: Node 24 in the sandbox, so T388 and T369 run here
  worked-anyway: CI ran them; the DO needed no fix.

Decisions: none made, the owner decides.
