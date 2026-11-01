# Classification and inspection slice

Base: #814 merged at 6b2dcc8e9881c37c045748e30c44b4296b5e1eaa. Governing PLAN: #797/#801. This Change continues bounded TDD/DO without enforcement cutover, target modification, promotion or publication.

## Delivered scope

- The public classify() interface resolves consumer branch roles, identifies supported Engineer/Synchronize/Promote candidates from explicit commit-parent observations and selects the one permitted configured transaction/method.
- Snapshot completeness checks reject absent parents/tips/promoted roles, repeated IDs, cycles, mixed object-ID formats and inconsistent declared branch tips. Repository bindings are compared to the declaration; their real-world truth is not authenticated.
- Synchronization classification requires its head merge, collector ancestry and an admitted first-parent promoted source. Unincorporated promoted history after that head merge is refused. Intermediate source states and merges of already incorporated state retain the accepted classification distinctions.
- A conforming Agent Skill and public bin perform read-only snapshot inspection through the same engine, including relocation to a directory outside the package with an explicit runtime context.
- The inspector reports policy authority and Boundary evidence as not-verified. Unsupported phases return exit 5; no operation execution interface or GitHub adapter is added.

## Case scope

| Planned identity | Evidence added here | Still pending |
| --- | --- | --- |
| T1-T3 | Whole delivered pure engine and declared inspector bootstrap boundary; prohibited/undecidable controls | Full future adapter boundary and privileged runtime trust |
| T5 | Installed Skill passes Engineer Skill; broken internal reference is detected | Skill Node/Core admission |
| T6 | Both inspection modes preserve classification semantics without target installation | Authorized remote acquisition and live mode evidence |
| T8-T9 | Installed declared bin and relocated Skill use the public runtime | Full package/installation acceptance and all operational scripts |
| T12 | Configured names, role pairs and methods at runtime | Operational enforcement of obligations |
| T21/T23 | Commit-graph classification, including real local Git history | Merge trees, resolutions and full synchronization acceptance |
| T27 | Supplied snapshot structural consistency and declared target mismatch | Live attribution, revision freshness, permissions and complete host responses |

Other planned Case obligations remain pending. All 38 PLAN identities are retained; entries above are scoped evidence, not a blanket Case or capability completion.

## Provenance and preservation

The existing engineering/github/lineage.ts and lineage.test.ts are unchanged. Existing CI consumers remain authoritative. This slice maps accepted promotion source/method decisions and readSync's head/parent/ancestry distinctions into configurable product classification, without claiming the complete legacy implementation has migrated.

The original configuration acceptance assertions are unchanged. Its install setup adds Foundation and Hosting tarballs because the package now declares those runtime dependencies. The acceptance driver discovers this workspace's scenarios through Testing rather than copying their assertions into a new runner.

New installed acceptance assertions and their fixtures were fixed before classifier/CLI implementation and the behavioral RED run. The RED scaffold exports classify() but returns cannot-judge; the bin is loadable but returns unsupported, and the Skill has a deliberately invalid name. Failures are assertion failures after successful installation/import, not missing-module failures. Unchanged acceptance-test/fixture digests are recorded across GREEN and selected mutants.

Runtime, pure engine and bootstrap use one policy engine. Host file reads go through Hosting. Node's module/path/URL linker is explicitly declared for selecting the public installed runtime. Its computed import is a recorded architecture validation item, with the inspector's lack of trust authority stated; CommonJS resolution and indirect module host access remain inspection exclusions.

## Verification

The caller packs each candidate once and reuses baseline Hosting/Foundation prerequisite tarballs. Scenarios use Testing's install() and public package exports/bin only. The real-Git fixture is local disposable test data; External transport and GitHub integration are not simulated as passes.

Local verification runs on Linux/Node 24.22.1 with the existing Testing harness and accepted Hosting runtime source. The local Hosting fixture is transpiled from unchanged baseline source; it is a test prerequisite, not a newly verified Hosting release. Full repository and Windows/macOS CI remain required.

Evidence is in test/evidence/classification.json: loadable behavioral RED, final installed GREEN, source/test/artifact identities and selected discriminating mutants. Testing's containment and unrecorded-installation unknowns remain visible. The previous #814 configuration evidence is retained as historical, source-bound evidence.

