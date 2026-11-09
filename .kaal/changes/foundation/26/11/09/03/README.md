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

Case T70 (F43, front matter with a `tests` edge) is added, RED. T16, T17 and T47 are placed (Owner): generic acceptance is Delivery, governed by kaal-packaging, held by Engineering; T17 and T47 split. The untitled Cases (sha256, publication, verifier, manifest) get the next free T-numbers and `tests` edges in the DO (Owner). The `foundation/T999` fixture becomes `foundation/TX-undeclared` (Owner). No question is open.

Owner guidance (2026-11-09): capabilities are soft-tried, and Architecture also names what is placed here but belongs to an outside package. New: Intent I16 (comply with kaal-packaging; Foundation references the Packaging Cases it relies on, and no edge points from Packaging back to Foundation), F44 and A25 ("Placed here, belongs elsewhere").

Decided (Owner, 2026-11-09, "sounds fair"): circular dependencies are kept out by a rule. The Finding was: circular dependencies may stay tricky. Packaging will likely use Foundation as a solution dependency, while Foundation dev-depends on Packaging's Cases through its suite (I16). Rule: the solution graph stays acyclic, and a dev edge may point upward only to a pinned, released version, so there is no workspace-to-workspace cycle. Until Packaging goes online, Engineering holds the generic Packaging Cases, not Foundation (Owner, so other packages can reuse them), and Foundation's suite collects them from Engineering by reference.
