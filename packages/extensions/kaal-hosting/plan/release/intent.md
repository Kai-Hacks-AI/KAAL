# Scoped Package Name: Intent

This is `hosting/C10`, a PLAN Change. It states why Hosting renames its package, what the rename requires, where the responsibility lies, and the outer tests that decide it. It ships no code; `hosting/C11` turns the tests from RED to GREEN. It authorizes no rename, version change, sync, promotion or publication on its own: those stay with the Owner.

On #622 (comment 6503611371, 2026-10-29) the Owner aligned that Core, Graph, Hosting and Foundation publish under the `@kaihacksai/kaal-*` namespace, consistent with the published `@kaihacksai/kaal-guard`, and that each owning capability plans its own name and dependency updates and verifies its own packed consumer experience. Core records this as `core/F74` and `core/A36`, map row 6 of `core/C28`. Hosting goes first, because Graph and Core depend on it, and Graph's rename follows.

- **hosting/I5.** A consumer installs Hosting from the registry as `@kaihacksai/kaal-hosting` and uses it through that name alone, with the same interface and guarantees as today. Nothing in KAAL still reaches Hosting by its old name.
