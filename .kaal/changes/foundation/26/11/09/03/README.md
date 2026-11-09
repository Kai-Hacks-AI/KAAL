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
- Suite membership is a backwards analysis: each Case carries a `tests` edge in its own YAML front matter (Owner, 2026-11-09:
  defect <- test case); a suite is "who points at this?".
- The build ships the Solution branch only; the engineering suite pulls the Delivery branch.

Delivered by this PLAN: the four PLAN documents in `00-changes/architecture-tree/` and seven RED Cases T64 to T70 in
`04-test/engineering-check/plan/architecture-tree.test.mjs`, all RED because the tree, the folders and the build rule do
not exist (missing-deliverable evidence). The Testing document carries the inventory of today's Cases with a proposed
branch, the cross-cutting Requirements found so far, and the Cases to split (T15, T17, T18, T46, T47, T62).

Case T70 (F43, front matter with a `tests` edge) is added, RED. T16, T17 and T47 are placed (Owner): generic acceptance is Delivery, governed by kaal-packaging, held by Engineering; T17 and T47 split. The untitled Cases (sha256, publication, verifier, manifest) get the next free T-numbers and `tests` edges in the DO (Owner). Open: the `foundation/T999` fixture id.
