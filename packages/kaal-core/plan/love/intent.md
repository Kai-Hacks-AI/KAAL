# Core as a Package, and LOVE: Intent

This is `core/C16`, a PLAN Change. It ships no code. `core/C17` turns its planned tests GREEN.

The Owner set the direction on #276 (comment 6419391393). KAAL Core provides the management capabilities that make a consumer repository a KAAL-managed repository. Each discipline owns its own behaviour. LOVE is the test a package must pass before it steps up from internal capability to reusable or published package. This Change carries that direction into Core's Intent and Architecture. It evaluates `kaal-core` first, as the foundational repository-management package. Testing matures its evidence semantics in parallel, in its own PLAN, `testing/C7`.

- **core/I9.** Core provides the management capabilities that make a consumer repository KAAL-managed:
  - the recursive structure of Capabilities;
  - their composition;
  - installation contracts;
  - realization and lifecycle.

  Core owns none of the domain semantics of Intent, Requirements, Architecture, Code, Testing or Operating. Each discipline owns its own behaviour and may be delivered as its own structured, independently versioned package. A repository may consume such a package without onboarding fully to KAAL.
- **core/I10.** A package steps up from internal capability to reusable or published package only when it meets LOVE:
  - **Lifecycle:** it can be installed, upgraded, removed and versioned.
  - **Ownership:** it overlaps with no other owner.
  - **Verification:** independent evidence shows that it holds.
  - **Encapsulation:** consumers rely on its declared, consumer-visible interface, never on its internals.

  LOVE is a maturity judgment, not a mandate to publish. Deciding to package something never authorizes a release. Publication still needs the Owner's explicit authorization.
- **core/I11.** Ownership between Core and the disciplines never runs in a circle. Core depends on no discipline. A discipline that judges Core, as Testing judges evidence, owns none of Core's cases, and Core owns none of that discipline's semantics.
