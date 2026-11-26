---
id: testing/RT6
format: 4L
reflects: [testing/C81]
---
Account of: I am the coding agent who wrote the testing/C81 PLAN (#2518) and its DO (#2529) on collector kaal/testing/run-case-form, at the release capability's request for hold Act evidence; the CPO steered the end-to-end acceptance Case, and this is my own account.

## Liked
- subject: a throwaway prototype of the runner change written while the PLAN was drafted
  keeps: it showed the shape was feasible (T405 GREEN with five lines) and exposed the real risk, a changed file-level event that made `reconstruct` list a test for an empty file, so the PLAN named the risk and the DO kept the 15 C63 fixtures identical on the first attempt.
- subject: an end-to-end Case that runs collectCases, runCases and observeCases against a judged revision
  keeps: the consumer's contract (GREEN only with complete evidence, never from an error, timeout, missing file or wrong revision) is pinned where the consumer reads it, and not only in report fields.

## Learned
- subject: Testing's boundary test and its pinned bytes in packages/kaal-testing/evidence.kaal.json move together
  source: CI run 45709870182 failed Engineering with "boundary.test.mjs no longer holds the pinned bytes (stale)" after the DO declared node:test and recorded one judged dynamic import; the fix was one sha256 in the mapping.
- subject: a dynamic import of a user file is an undecidable item for Hosting's inspection and needs a recorded judgment
  source: test/boundary.test.mjs failed "permitted" and "undecidable" until the import in lib/run-case.mjs was added to VALIDATED and the undecidable Case expected it.

## Lacked
- subject: the end-to-end consumer Case in the first PLAN revision
  decision-point: stopping the PLAN at report-level Cases (T405, T406), which assert the run report and not what observe reads from it.
  cost: one CPO review round on #2518 and a new Case (T407) before approval.
  findable: yes
  address: Skill
- subject: knowing which files other mappings pin before changing a Testing test file
  decision-point: editing test/boundary.test.mjs and running only the package's own npm test.
  cost: one failed Engineering CI run and a repin commit on #2529.
  findable: yes
  address: script

## Longed For
- subject: one command that runs the package suite and the engineering contract checks that pin its files
  worked-anyway: CI ran them and named the stale pin within minutes.

Decisions: none made, the owner decides.
