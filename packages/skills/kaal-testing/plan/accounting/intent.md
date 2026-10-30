# Requirement Coverage: Intent

This is `testing/C33`, a PLAN Change. It ships no code. `testing/C34` turns its planned tests GREEN.

**What is missing.** Packaging's generic KAAL Package contract (packaging/F13, #658) requires every Requirement a package ships to be traced to an applicable case or to an explicit allocation, and leaves what covered, allocated and unverified mean to Testing. Engineering's release baseline (#610, `engineering/research/release-baseline.md`) records the gap: no testing/ identifier defines them for a shipped package. Each product states its own:
- Guard: guard/F38 and guard/F40.
- Hosting: hosting/F23 and hosting/F25.
- Core: core/F71.
- Graph: graph/F5, which states no allocation.
- Change: change/F20, which states no allocation.

The local definitions differ on one point. Guard makes an identifier covered only by not-applicable cases `cannot verify`, unless the identifier itself is declared not applicable. Hosting says only that such a case "does not keep the run from verified". Testing proposed this PLAN on #610, and Packaging's sequence (#658, step 3) places it beside `testing/C29`.

**What exists.** `kaal-testing/verifiers` (testing/A18, `testing/C30`) gives the shared observable result contract: the scenarios, `observe`, and `judge`. It covers case outcomes and applicability (testing/F47), but no coverage.

- **testing/I15**: Every identifier a package ships is accounted for in one state, from what the harness established. An identifier is in exactly one of these states:
  - covered by a declared case that ran and passed;
  - allocated to the publisher's Engineering Test Plan, with what the publisher runs;
  - stated verified by no Test Case, with the reason;
  - not applicable here, by the same established applicability as its cases.

  Otherwise it is uncovered or not verified here, and the run is unknown. Allocated, unverified and not applicable never count as covered. A verified run lists each of them, so verified never conceals one. Testing owns these meanings. Each package keeps its own trace, and the harness establishes which identifiers the package ships.
