# Cross-Platform Inventory Parity: Intent

This is `testing/C31`, a PLAN Change. It ships no code. `testing/C32` turns its planned tests GREEN.

**What the Owner set.** On #639 (comment 6509984871), the Owner made `not applicable` an accountability outcome, not a platform escape hatch. It guards against two evasion modes:
- **Silent omission:** a declared case left out on an inconvenient platform.
- **Conditional weakening:** a case that branches on the platform to weaker assertions while reporting GREEN.

The Owner asked that the follow-up be scoped without silently expanding #639. `testing/C29` judges one platform's run at a time (testing/F48). Testing proposed this Change on #639 (comment 6510069024) to judge a candidate's runs across its platforms together. Engineering (#641) keeps two things: running each platform, and the static scan for platform markers in tests.

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
  - Where Engineering's enforcement leaves an unresolved weakening finding on a case, the evidence for that case is unknown, never GREEN.
  - Testing judges the runs it is given and runs nothing.
