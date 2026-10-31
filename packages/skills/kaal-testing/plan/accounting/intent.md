# Requirement Coverage: Intent

This is `testing/C33`, a PLAN Change. It ships no code. `testing/C34` turns its planned tests GREEN.

**What is missing.** Packaging's generic KAAL Package contract (packaging/F13, #658) requires every Requirement a package ships to be traced to an applicable case or to an explicit allocation, and leaves what covered, allocated and unverified mean to Testing. Engineering's release baseline (#610, `engineering/research/release-baseline.md`) records the gap: no testing/ identifier defines them for a shipped package. Each product states its own:
- Guard: guard/F38 and guard/F40.
- Hosting: hosting/F23 and hosting/F25.
- Core: core/F71.
- Graph: graph/F5, which states no allocation.
- Change: change/F20, which states no allocation.

**What exists.** Testing's model (testing/F24–testing/F25, `kaal-testing/model`) already states which Cases test which targets: each Case's `tests`, stated once on the Case, with the other direction derived by `tested`. Packaging C7 adopted that model instead of a coverage registry. `kaal-testing/verifiers` (testing/A18, `testing/C30`) gives the shared observable result contract, with case outcomes and established applicability (testing/F47), but no coverage.

**One source of truth.** Kai's review of the first revision: a manifest `coverage` mapping would be a second source of truth beside the model. So coverage is derived from the model's Case traces and one run's case outcomes. The two things a trace cannot say, an allocation to the publisher's Engineering Test Plan and a reason that no Test Case verifies a target, are recorded in the same model as target entries, which never restate a trace.

- **testing/I15**: Every identifier a package ships is accounted for in one state, derived from Testing's model and what the harness established. An identifier is in exactly one of these states:
  - covered by a declared case, tracing it in the model, that ran and passed;
  - allocated to the publisher's Engineering Test Plan, with what the publisher runs;
  - stated verified by no Test Case, with the reason;
  - not applicable here, because every case tracing it is, by the applicability the harness established.

  Otherwise it is uncovered, and the run is unknown. Evidence of coverage is not a verified run. Allocated, unverified and not applicable never count as covered. A verified run lists each of them, so verified never conceals one. Testing owns these meanings. Each package keeps its own model, and the harness establishes which identifiers the package ships.
