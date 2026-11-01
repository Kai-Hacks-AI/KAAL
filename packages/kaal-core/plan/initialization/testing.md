# Core 0.0.1 initialization and consumer completion: Testing

The executable publisher cases are `test/plan/initialization.test.mjs`, core/T98–T106. They use Core's existing public API/CLI and Hosting for commands, with no platform branch. They are run separately for this PLAN and remain immutable to DO. No shipped manifest or default test suite is changed here.

| Case | Loop | Contract and discriminator |
| --- | --- | --- |
| core/T98 | Architecture | F89: Core Skill and Skill Node exist, the Node is admitted through Core's public evaluator, and both are included by the pack file list. A prose-only Skill or a file omitted from the package fails. Skill format/quality and external placement remain Engineer Skill's/review's, not a regex substitute. |
| core/T99 | Requirements | F90: delivered AGENTS navigation names the scoped package and shipped Skill path. This checks navigation anchors only; procedure quality and authority language require review. |
| core/T100 | Intent | F91: explicit new `init` yields Core/Foundation/Hosting/Core Skill in the public catalogue, of their proper kinds, and verifies. Repeating the complete initialization changes no bytes. File presence is insufficient. |
| core/T101 | Requirements | F92/N24: a valid bare Engine, made by generic bootstrap, is refused as an incomplete initialization and kept unchanged. Generic verification still succeeds. Silent adoption or partial writes fail. |
| core/T102 | Requirements | F93: a valid Skill Node outside the Engine stays absent from its catalogue; explicit registration admits it. The test shows no automatic registration and makes no claim to prevent ordinary filesystem use. |
| core/T103 | Requirements | F93/N24: a malformed Skill contribution is rejected, leaves the Engine unchanged and never appears as admitted. |
| core/T104 | Intent | N25: read-only `list`, `resolve` and `verify` against a named external Engine preserve both target and controller. No controller `.kaal` appears. |
| core/T105 | Architecture | F95: the full existing release file is declared as its own source suite, without a test-name filter. Existing runner T80 proves comprehensive source suite execution. |
| core/T106 | Architecture | F94: a healthy current candidate's consumer verifier emits the normalized candidate-specific final JSON report, with observed passing cases and no causes. Missing identity, counts-only evidence or unparseable reporting fails. Full negative vocabulary remains tested by revised T91 and independent conformance. |

## Acceptance scenarios that must be made executable before their DO

These are precise acceptance designs, not executed or GREEN cases. Declaration-transport fixtures and Testing/Packaging imports await their owner contracts. They are not replaced by mocks claiming installed-consumer evidence.

| Case | Preconditions and observable acceptance |
| --- | --- |
| core/T107 | Pack the candidate once. Install copies into a fresh project using explicit dependency artifacts, without Graph/build tools or a repository. Record tarball SHA-256 separately, exact exports/inventory and installed manifest. Execute every documented public API/CLI operation and installed npm test. Mutating/removing a shipped file gives cannot verify; an intact declared behavioral failure gives failed. Breaking modules and refreshing hashes still cannot produce verified. Repeat a clean locked build and compare shipped content/digests. Core/T76/T83/T95/T97 and Packaging's behavior probe are reused, not duplicated. |
| core/T108 | In fresh installed fixtures, independently remove each required owner declaration, break its type reference, supply the wrong CASE kind, collide a scope/name, and corrupt its bytes. Explicit init exits nonzero naming the owner/reason; no target file/record is written; no contribution is reported admitted. Then restore the valid owner declaration and establish the positive initialization. No substitute declaration is authored by Core. |
| core/T109 | On Linux/macOS/Windows, run the same installed candidate's npm test in the existing Acceptance scenario. Retain candidate/manifest, host, exact case identity and every outcome with existing run evidence. A missing, skipped, cancelled or failed host is unresolved/failing under existing policy, never three-host success. This challenges Core's use of Hosting; Hosting's own platform cases are not copied. |
| core/T110 | Run Packaging's public conform/conformSource against that same candidate, with real Testing model functions and the actual install record. Verify exact model-to-delivered-case identity and defined targets; omitted/dangling/retired cases cannot count as executed coverage. Local dependency artifacts remain an explicit registry-readiness failure, not an invented registry success. Missing model/tool interfaces remain unknown. No model implementation is copied into Core. |
| core/T111 | Verify ownership-preserving configuration/lifecycle: installing/importing/reading guidance writes no Engine; init writes only explicitly targeted Core-managed assets/contributions and agreed records. Refusal preserves arbitrary existing author files, AGENTS/CLAUDE guidance and target configuration. Upgrade/remove preserve modified and consumer/other-owner files under existing contracts and do not silently claim dependency lifecycle. External inspection changes nothing; external activation/arbitrary-target upgrade is not offered. Reuse existing lifecycle/conformance negatives. |

## Validation

Review decides whether the Skill's procedure is usable, whether navigation grants no authority, whether the dependency declarations and records preserve their owners' contracts, and whether delivered documents describe the implemented boundary honestly. No test outcome is that validation. Tests do not claim an agent actually used a Skill.

The CHECK's six untested responsibility/runtime statements in docs/testing.md are not hidden coverage failures to paper over. Report the final model's delivered, publisher-only and unverified targets honestly using Testing's meanings.

## Evidence

Preparation results, exact commands, RED/GREEN case outcomes and limitations are recorded in `evidence.md`. Existing source suites and the committed manifest remain unchanged. Cross-platform and fresh installed-candidate acceptance are not claimed from local source runs.
