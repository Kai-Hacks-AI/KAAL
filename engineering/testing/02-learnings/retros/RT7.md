---
id: testing/RT7
format: 4L
reflects: [testing/C82]
---
Account of: I am the coding agent who wrote the testing/C82 PLAN (#2638) and its DO (#2647) on collector kaal/testing/observe-cases-at-revision, at Kai's go and with the release and engineering threads, and this is my own account.

## Liked
- subject: agreeing the record form with its consumers before writing the PLAN
  keeps: release confirmed its hold Act reader reads only four fields and needs no schema, so the record stayed a superset of what `observe` gives and no reader changed; engineering's reply fixed the call shape and the file name.
- subject: a throwaway prototype of lib/observation.mjs and the command before the PLAN was raised
  keeps: it showed that T411 to T413 can go GREEN, so the PLAN's Cases ask for something buildable and the DO was a rewrite of known code.

## Learned
- subject: a consumer that runs candidate code needs the split form, not only the one-step form
  source: engineering's correction on the thread after the PLAN was up: release's C135 already runs the Cases in one job and observes in a trusted one, so `observe-at --report` is the entry it uses and the one-step form is the convenience.
- subject: a Case that cannot run on the local Node can hide a failure it would show in CI
  source: T369 pins the package's exports and fails here on Node 22 before reaching that line, so the new `./observation` export first failed the Workspaces check in CI (run 45873927688); the fix was one line in T369.

## Lacked
- subject: a search for every Case that pins the package's export list before adding an export
  decision-point: adding `./observation` to package.json and updating T160 only.
  cost: one failed Workspaces CI run and a second DO commit on #2647.
  findable: yes
  address: script
- subject: the consumers' split of run and observe in the first message to engineering
  decision-point: telling engineering a one-step call suited the workflow before reading release's C135 on main.
  cost: one correcting message from engineering and a message from me; the PLAN already held the split form, so no rework.
  findable: yes
  address: Skill

## Longed For
- subject: Node 24 in the sandbox, so every Case that asserts it runs here
  worked-anyway: CI ran them and named the failing line within minutes.

Decisions: none made, the owner decides.
