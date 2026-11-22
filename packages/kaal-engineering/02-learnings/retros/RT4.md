---
id: engineering/RT4
format: 4L
reflects: [engineering/C30]
---
Account of: I am the Engineering worker. I planned, built and raised the PLAN (#2316) and the DO (#2318) of C30 (the layout check says in or out of the specification), took in the Defect engineering/D4 that the defect capability recorded, and changed the PLAN twice after the CPO's review. This is my account only: I have not asked the Owner or the CPO what they lacked.

## Liked
- subject: the Defect arriving as a record with a reproduction and no Case
  keeps: D4 came from the defect capability within minutes, named both directions with two pure calls, and left the Cases to the Change, so the PLAN started from facts and not from my own reading of the complaint.
- subject: a throwaway copy with the draft check, run over the existing Cases and over the real packages
  keeps: it showed before the PLAN which three older Cases would break, and that all 14 packages would be FAIL with 10 to 17 findings each, so the questions to the Owner were about real numbers.

## Learned
- subject: an existing Case can pin the very defect it sits beside
  searched: T1231 and T1243 on the collector; T1231 asserted that an unnumbered folder is not judged and T1243 that a package with no `14-operations` is PASS, so both had to be amended with the fix.
- subject: the template says one layout for three places, but the required set only fits `packages/<cap>`
  searched: the CPO's review of #2316 (answer to Question 2) and `package-layout.md`; a consumer place does not need `package.json`, so its requirements are decided when the check is extended to it.

## Lacked
- subject: nothing made me write the Cases as plain `.test.mjs`
  decision-point: writing T1380 to T1382 for the PLAN.
  cost: I wrote them as `.red.mjs` and a DO rename, as in C28 and C29, which the CPO accepted then and sent back now; one more push and one more review round. The rule was in the project's standing notes and I did not read it before writing.
  findable: yes
  address: Skill
- subject: a shared fixture for the layout Cases
  decision-point: writing the three new Cases beside fifteen that each copy the same fixture.
  cost: RT1 named this; I made a shared `fixture.mjs` for the new Cases only, so there are now two ways, and the three amended Cases still carry their own copy.
  findable: no
  address: script
- subject: a way to tell a stale failing check from a real one
  decision-point: Change Isolation failed on a head that I had already pushed over with a newer one ("the head moved while judging").
  cost: I read the run before seeing it belonged to the older head; no harm, one extra look.
  findable: no
  address: Skill
- subject: nothing says which parts of the layout apply to a consumer place
  decision-point: choosing the required set for the check.
  cost: the CPO decided it in review; a package-only required set is written down, and the other two places remain undefined.
  findable: no
  address: Skill

## Longed For
- subject: a baseline and a ratchet over the 14 findings lists, with the exit the Owner set (plain preventive at 0)
  worked-anyway: the check runs and reports per package, nothing fails, and the report is in `do.md`.
- subject: the first package moved into the layout, to show what PASS looks like on real data
  worked-anyway: PASS is shown on fixtures; no real package is in the layout.

Decisions: none made, the owner decides.
