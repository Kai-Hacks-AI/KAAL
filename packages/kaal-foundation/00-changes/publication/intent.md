# Publication Readiness: Intent

This is `foundation/C3`, a PLAN Change. It ships no code. `foundation/C4`, its DO, turns the planned tests GREEN. It authorizes no synchronization, promotion, version change or npm publication: those remain the Owner's.

On #622 (2026-10-29) the Owner decided that Foundation becomes a separately installable, published package, so that kaal-core's runtime dependency resolves for a fresh consumer. Foundation's owner plans and verifies its own readiness, and the version and the publication stay with the Owner. Until now, `foundation/C1` kept the package `private` and its name provisional.

On #626 the Owner held Foundation to the KAAL-wide consumer delivery bar that `@kaihacksai/kaal-guard` sets: a single pure function needs a small verification surface, not none. And the Owner's test-entry convention (#625) applies here as it does to Core: in the source workspace `npm test` is comprehensive, and in an installation it runs the consumer verification only.

- **foundation/I4.** `@kaihacksai/kaal-foundation` can be installed by itself, from its packed artifact, by a consumer with no KAAL repository, and it works there exactly as it does in the workspace.
- **foundation/I5.** Foundation is ready to publish, but this Change publishes nothing. Its name follows the Owner's `@kaihacksai/kaal-*` namespace, which it already has.
- **foundation/I6.** A consumer who installs Foundation receives what Guard's consumers receive: concise documents that explain the package, and a delivered `npm test` that verifies the installed copy and reports an honest result.
