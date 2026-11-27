---
id: change/RT2
format: 4L
reflects: [change/C15, change/C16]
---
Account of: I am the change thread. I planned and delivered change/C15, how a Change Record states the Changes it succeeds, and change/C16, the two detective controls over dependencies, each as a PLAN and then a DO into `kaal/change/succession`. This is my account only: the CPO's holds are quoted as they were given, and the Owner has not been asked what they lacked.

## Liked
- subject: the CPO's holds named a missing case, not a preference
  keeps: each hold said which input the code passed over silently (a `succeeds: invalid` read as no statement, a cycle read as an order), so each fix came with a Case that fails without it.
- subject: keeping identity, satisfaction and revision apart
  keeps: the three facts in the C15 PLAN made every later question answerable from the table, including why matching bytes alone are not delivery.

## Learned
- subject: a reader that skips what it cannot parse reports a pass
  source: `succeeds: invalid` produced no edge and no finding, so a downstream control would have passed it; every unreadable statement is now a finding.
- subject: an invalid edge must be dropped before anything is ordered by it
  source: identify Conflict used the edges of a cycle to order a pair of Changes and accept a stated resolution; edges inside a cycle now order nothing.
- subject: a Case must be checked to fail without its fix
  source: my first cycle Case used two Changes, which were unordered already, so it passed without the fix; a three-Change cycle was needed.
- subject: a squash merge of the base breaks a stacked branch
  source: after #2726 merged, #2727 conflicted in `package.json` and `test/verify.json` and had to be merged by hand; the manifest is regenerated, never merged.

## Lacked
- subject: a check that a PLAN ships no empty Case file
  decision-point: approving the C16 PLAN, which carried an empty `T1568.red.mjs`.
  cost: the DO had to remove it and keep a gap in the numbering.
  findable: no
  address: control
- subject: a way to run the packed acceptance Cases locally
  decision-point: adding delivered files that change the packed inventory.
  cost: I could not see the acceptance result before the PR was open.
  findable: no
  address: script

## Longed For
- subject: evidence that a consumer reads the new statements in practice
