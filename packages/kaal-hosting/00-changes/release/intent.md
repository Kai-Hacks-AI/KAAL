# Release Readiness: Intent

This is `hosting/C10`, a PLAN Change. It states why Hosting renames its package and becomes a complete, consumer-verifiable product, what that requires, where the responsibility lies, and the outer tests that decide it. It ships no code. `hosting/C11` applies the rename and turns hosting/T21–T24 GREEN; `hosting/C12` delivers the product contract and the consumer verification and turns hosting/T25–T31 GREEN. It authorizes no rename, version change, sync, promotion or publication on its own: those stay with the Owner.

On #622 (comment 6503611371, 2026-10-29) the Owner aligned that Core, Graph, Hosting and Foundation publish under the `@kaihacksai/kaal-*` namespace, consistent with the published `@kaihacksai/kaal-guard`, and that each owning capability plans its own name and dependency updates and verifies its own packed consumer experience. Core records this as `core/F74` and `core/A36`, map row 6 of `core/C28`. Hosting goes first, because Graph and Core depend on it, and Graph's rename follows.

- **hosting/I5.** A consumer installs Hosting from the registry as `@kaihacksai/kaal-hosting` and uses it through that name alone, with the same interface and guarantees as today. Nothing in KAAL still reaches Hosting by its old name.

On #629 (2026-10-29) the Owner asked that Hosting reach the bar `@kaihacksai/kaal-guard` set for its Intent, Requirements, Architecture and, above all, its consumer-facing tests. Hosting's guarantees are about the host, so the strongest evidence of them is the consumer's own run on the consumer's own host.

- **hosting/I6.** A consumer verifies that the Hosting they installed keeps its guarantees on their host, with one documented command, with no KAAL checkout and nothing installed beyond Hosting and its runtime dependencies. The run exercises the installed copy, leaves the consumer as it was, names what it exercised, and ends in one of three results: verified, failed or cannot verify.
- **hosting/I7.** The installed package is a complete, intelligible product. It carries its Intent, Requirements, Architecture, Testing and Limitations, and the Test Cases for what it promises, in each loop it owns. They are authoritative in the package and usable without this repository.
