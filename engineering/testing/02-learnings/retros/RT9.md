---
id: testing/RT9
format: 4L
reflects: [testing/C84]
---
Account of: I am the coding agent who wrote the testing/C84 PLAN (#2881) and its DO (#2889) on collector kaal/testing/judged-revision-evidence, at Kai's go, and this is my own account.

## Liked
- subject: a throwaway prototype of the check and the two edited lines before the PLAN was raised, as for C83
  keeps: it showed that T423 to T425 can go GREEN and that T411 to T413 stay GREEN, so the PLAN's Cases asked for something buildable, and the DO merged on its first CI run.
- subject: reading each CPO hold as a change of level and not of wording
  keeps: the first hold (trigger and judged may coincide) and the second (no source in the contract) were both answered by restating the contract and the Cases together, with no redesign argued.

## Learned
- subject: a Testing contract carries no source concept
  source: the CPO's second hold on #2881: Git commits, branches, event heads and trigger revisions are Hosting's and the source's facts, so the contract is content identity, an opaque string, and Testing checks the evidence against what the consumer examined.
- subject: the same record can serve a new contract without a new field
  source: the observation record already had `revision` and `expectedRevision`; stating them as the recorded and the examined identity changed no reader, and only added a finding to `evidence.integrity`.

## Lacked
- subject: the question "what would this say for a source that is not Git?" before the first PLAN text
  decision-point: writing F177 from release/D20's own vocabulary (head, merge commit, trigger, 40 or 64 hex) instead of from what Testing is for.
  cost: two held reviews, a renamed Change folder, new drafts, and three Cases rewritten.
  findable: yes
  address: Skill

## Longed For
- subject: Hosting's statement of what it provides as content and provenance, before Testing's side of the contract
  worked-anyway: the check takes both identities as input, so it did not wait for Hosting.

Decisions: none made, the owner decides.
