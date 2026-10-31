# Cross-Platform Inventory Parity: Intent

This is `testing/C31`, a PLAN Change. It ships no code. `testing/C32` turns its planned tests GREEN.

**What the Owner set.** On #639 (comment 6509984871), the Owner made `not applicable` an accountability outcome, not a platform escape hatch. It guards against two evasion modes:
- **Silent omission:** a declared case left out on an inconvenient platform.
- **Conditional weakening:** a case that branches on the platform to weaker assertions while reporting GREEN.

The Owner asked that the follow-up be scoped without silently expanding #639. `testing/C29` judges one platform's run at a time (testing/F48). Testing proposed this Change on #639 (comment 6510069024) to judge a candidate's runs across its platforms together. Engineering (#641) keeps two things: running each platform, and the static scan for platform markers in tests.

The Owner then set (#668, comment 6535329511) that Hosting is the only KAAL capability in which OS-specific behaviour is acceptable, in both the solution and its tests. Testing's `not applicable` must not become a general escape hatch. The responsibilities split three ways:
- Hosting supplies a test suite and review guidance that challenge every other capability on this rule.
- Testing defines the outcomes and the cross-platform evidence semantics, and authorizes no OS exception.
- Engineering executes and enforces the checks, without owning Hosting's rule.

**What exists.**
- `kaal-testing/verifiers` (testing/A18, `testing/C30`) observes and judges one run.
- testing/F47 establishes a case's applicability.
- testing/F48 keeps every declared case visible on one platform.

Nothing yet says that the platforms' runs show the same cases, or that a case not applicable everywhere is exercised nowhere.

- **testing/I16**: One candidate's runs, one on each platform it supports, are read together:
  - The same declared cases stand on every platform, by identity.
  - Each case is visible in every platform's evidence, with its outcome there.
  - A case is exempt on a platform only by that platform's established applicability, and an exempt case is never counted as passed.
  - A case exempt on every platform is exercised nowhere, so it never verifies.
  - A case is exempted by a platform scope only in the operating-system boundary, Hosting. In any other package, a platform scope is an architectural violation, not an exemption.
  - Where a challenge leaves an unresolved finding on a case, the evidence for that case is unknown, never GREEN. The challenge is Hosting's cross-capability suite and review, or Engineering's enforcement.
  - Testing judges the runs it is given and runs nothing.
