# Testing 0.0.1 Release Readiness: Intent

This is `testing/C35`, a PLAN Change. It ships no code. `testing/C36`, `testing/C37` and `testing/C38` turn its planned tests GREEN. Publication stays the Owner's.

**What the Owner set.**
- Testing 0.0.1 is one of the five delivery objectives (2026-10-29).
- Every package meets Guard's bar: shipped documents of intent, requirements and architecture, and consumer-facing tests.
- The test-entry convention comes from #625: in the source workspace, `npm test` is comprehensive; in an installation, it runs the consumer verification only.
- The Owner accepted the name `@kaihacksai/kaal-testing` on #669.
- Hosting alone owns OS-specific behaviour, in solutions and in tests. It challenges every other capability through its boundary suite and review guides.
- Packaging's generic KAAL Package contract (#658, packaging/F7–packaging/F14 and packaging/N7–packaging/N10) states what every KAAL package does. Each product aligns through its own Change.

**What exists.** The package is named `kaal-testing`. It ships `capability/`, `lib/`, `payload/` and `skills/`, with no documents and no test. Its `npm test` is the publisher's suite, and a `pretest` step builds kaal-core and kaal-hosting in the workspace, which cannot run in an installation. Its runtime dependencies are `c8` and `kaal-hosting`, which its acceptance and coverage exports use at runtime. Its Intent, Requirements, Architecture and Testing live in `plan/`, which does not ship. Testing owns the meaning of consumer verification (testing/F11–testing/F17), the shared verifier contract (testing/F43–testing/F50) and the Test Case model whose `tests` edges trace each Case to what it verifies (testing/F25, testing/F40). Testing does not yet meet any of these as a package.

- **testing/I17**: kaal-testing 0.0.1 is a KAAL Package to Packaging's contract and to Guard's bar. It is published under its scoped name with exact registry dependencies. An installed copy carries its own product contract and its delivered cases. Its own verifier verifies that copy, in Testing's words, conforming to the contract Testing sets for every other verifier. Testing holds itself to its own semantics first.
