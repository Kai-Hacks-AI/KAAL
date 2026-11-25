---
id: backlog/RT1
format: 4L
reflects: [backlog/C1, backlog/C2]
---
Account of: I am the backlog thread. I wrote the design, the PLANs and the DOs of C1 (item check) and C2 (fast-lane qualify) and this retro of my own collector. This is my account only: I have not asked the CPO or Testing what they lacked.

## Liked
- subject: red Cases written in the PLAN before any code
  keeps: T490 to T499 made both DOs mechanical. Each DO was one pure module plus renaming its Cases to `.test.mjs`, and no design question came back during the DO.

## Learned
- subject: a judge written as a list of refusals permits whatever the list forgot
  source: the CPO review of #2449 found that `qualify` refused the statuses D, R and T but returned `qualified` for an unknown or missing status. The PLAN's F4 said "only added or modified qualify", and I implemented it as exclusion. The fix made permission positive (only explicit A and M) and extended T495 with unknown, malformed and missing statuses.
- subject: a merged sibling puts the next DO behind its base
  source: after #2447 merged, #2449 reported behind the collector and needed the collector merged in before auto-merge could proceed.

## Lacked
- subject: nothing in the PLAN Case checklist asked for a negative Case per input dimension of a judge
  decision-point: writing T495, when I listed refusals for path, mode and deletion but not for the status value itself.
  cost: one CPO revision round on #2449.
  findable: yes
  address: kaal-requirements

## Longed For
- subject: a way to run the judge on the effective diff of a real branch before the DO, to see which statuses actually occur
  worked-anyway: I reasoned from the Git status letters and wrote the entries by hand.

Decisions: none made, the owner decides.
