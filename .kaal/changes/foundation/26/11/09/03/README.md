# Foundation: the Solution / Delivery architecture tree (PLAN)

Capability owner: Foundation. Logical Change foundation/C21 (PLAN); the DO follows after review. Numbers are provisional
until the collector integrates them. It authorizes no promotion, version bump on main, SYNC, ledger entry, release
dispatch or npm publication, and it moves no Case and rewrites no Architecture element.

The Owner's standard of 2026-11-09, which this PLAN states and tests:
- Every Case sits next to what motivated it (Intent, Requirements, Architecture, Defects). The `04-test/` folders only
  collect Cases into suites, by reference.
- Architecture is a tree with two branches, Solution (ships) and Delivery (never ships), either/or. Elements are the
  leaves. Cross-cutting shows only higher up, as an Intent or Requirement that leaves in both branches answer.
- A Defect hangs off one Architecture element and takes its branch.
- Suite membership is a backwards analysis: each Case points, in YAML, at what it verifies; a suite is "who points at
  this?". The carrier of the YAML is an open question for the Owner.
- The build ships the Solution branch only; the engineering suite pulls the Delivery branch.

Delivered by this PLAN: the four PLAN documents in `00-changes/architecture-tree/` and six RED Cases T64 to T69 in
`04-test/engineering-check/plan/architecture-tree.test.mjs`, all RED because the tree, the folders and the build rule do
not exist (missing-deliverable evidence). The Testing document carries the inventory of today's Cases with a proposed
branch, the cross-cutting Requirements found so far, and the Cases to split (T15, T18, T46, T62).

Open: the carrier of the pointers (F43); whether a Solution Case that needs delivery machinery (T16, T17, T47) is pulled
by the engineering suite; the untitled Cases; the `foundation/T999` fixture id.
