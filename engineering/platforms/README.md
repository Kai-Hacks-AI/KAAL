# Platform evasion in tests

> PLAN (engineering/C9): nothing below exists yet. The Owner's direction on #641 (comments 6509987186 and 6510003813), coordinated with Testing's #639, is to defend against two platform-specific ways a test can evade. This is a separate, bounded Engineering Change, because both checks reach beyond engineering/C7's packed-artifact harness. The Owner's requirement on #641 (comment 6510106826) places the second check's rules with Hosting, in a reusable boundary conformance suite that Hosting plans in its own Change. Engineering discovers and runs that suite. It writes no detection rule of its own. Approving this PLAN authorizes only its DO, on `kaal/engineering`.

## Why this is not C7

engineering/C7 (#641) runs one shipped package's installed verifier and judges it with testing/C29's cases. Within that run, testing/C29 already catches a declared case missing from the output, and an unsupported "not applicable".

These two checks are wider:

- They cover every test suite in the repository, the source suites as well as installed verifiers.
- They compare runs across Windows, macOS and Linux, which no single run can see.
- They read the code itself, statically, through Hosting's suite.

Adding them to C7 would enlarge its approved scope, so they stand here. Each consumes C7's per-platform observations where those exist, without changing C7.

## The two checks

- **engineering/F9. Inventory omission.** For each suite, Engineering takes the Test Case identities each platform's run *observed*. It reads them from a stated structured result: testing/C29's summary `cases` for a verifier, and `node --test --test-reporter=tap` or a structured reporter for a source suite, never the default output. It compares them with the identities the suite *declares*, and across the three platforms.
  - A case declared but not observed on a platform is a **finding** that names the case and the platform.
  - A case observed on one platform and missing on another is a finding too.
  - The comparison is deterministic: the same results always give the same findings.
- **engineering/F10. Running Hosting's boundary suite.** Hosting owns a reusable boundary conformance suite. It defines the allowed host abstractions, the prohibited direct platform coupling, and what counts as a finding: direct OS branching, platform-dependent registration, skips, weakened assertions or a substituted trivial GREEN, and direct host-specific APIs where Hosting should mediate. Engineering discovers every Capability package and runs that suite over it, over its production code and its test code alike: publisher-only tests, scripts, fixtures and helpers included. It reports the results **per Capability**, each finding naming the file, the line and Hosting's rule. Engineering adds no pattern of its own and decides no finding. Identical inventories across platforms do not clear a finding. A finding is for review, not an automatic failure, and each Capability corrects its own.
- **engineering/F11. What review decides.** A finding is resolved by human–agent validation, recorded with who judged, what and where. The question, as Hosting's suite frames it, is whether platform-specific setup leaves the assertions intact and cannot give a false GREEN. Until it is validated, the match stays **unresolved**, visible on every run and never counted as passing.
- **engineering/N6. Hosting, and other exceptions.** Hosting exercises OS-specific semantics by design. Which of its own sources its suite exempts, and what justification and evidence any other exception needs, are Hosting's rules. Engineering applies them and records each exception beside its finding. Hosting is not exempt from F9, because a Hosting case missing on one platform is still a finding.
- **engineering/N7. "Not applicable" is accountable.** A case that is not applicable on a platform must show its applicability: the platforms in its scope and its reason, as testing/F47 defines. It is reported visibly, justified independently of the case's own code, and never counted as passed.

## Dependencies

| Prerequisite | Owner | Kind | State |
| --- | --- | --- | --- |
| The observable result, Test Case identity and applicability semantics | Testing | Semantic reference. The DO also calls `kaal-testing/verifiers` to read verifier summaries | Planned in testing/C29 (#639) |
| Declared case inventories for source suites | Each Capability, in its own suite | Semantic reference: Engineering reads what each suite declares and writes nothing in it | Today only verifiers declare one (testing/C29's manifest). For a source suite without one, F9 compares platforms against each other only, and says so |
| Per-platform runs | Engineering's lanes, in CI | Delivery: running the lanes on three platforms is a `.github/` Change of its own | Hosting and Acceptance run on three platforms today. The Workspaces lane is Linux-only |
| The boundary conformance suite: allowed abstractions, prohibited coupling, finding rules, tested with positive and negative fixtures | Hosting | Technical: F10 imports and runs it. Order prerequisite for F10 | To be planned in Hosting's own Change (#641, comment 6510106826). Engineering asks for it and writes nothing in Hosting's tree |
| Installed-verifier observations | engineering/C7 (#641) | Order: F9 uses them once C7 lands | Planned |

## Test Cases

These go in `engineering/platforms/platforms.test.mjs`, on fixtures in a scratch directory. Each is first observed RED against a deliberately wrong implementation.

| Test | Checks | Deliberately wrong implementation that makes it RED |
| --- | --- | --- |
| engineering/T16 | A fixture case registered only `if (process.platform !== "win32")` is reported missing on Windows, naming the case | One that compares only the counts per platform |
| engineering/T17 | Identical results on three platforms give no finding, and the same input always gives the same findings | One that orders findings by arrival |
| engineering/T18 | With a fixture suite standing in for Hosting's, every fixture Capability is run, production and test sources both, and each finding the suite reports appears under its own Capability, naming file, line and rule. A fixture with no finding is reported as such, never omitted | One that runs the suite over test directories only, or merges Capabilities into one result |
| engineering/T19 | A finding without a validation record stays unresolved and is never counted as passing. With a record, it shows as validated, citing the record | One that treats flagged as passed |
| engineering/T20 | A "not applicable" case without a platform scope and a reason is a finding, and one with both is shown, never counted as passing | One that counts not applicable as passing |

## What stays as it is

Guard-quality consumer package tests stay at their bar. This Change adds findings and review, and it relaxes nothing. Hosting's suite, and its own positive and negative fixtures (a T114-like OS-specific skip among them), are tested in Hosting's Change, not here. No test is skipped, rewritten or moved by Engineering.

Approving this PLAN authorizes the engineering/C9 DO only. It authorizes no synchronization, promotion or publication, no workflow change, and no Change in another Capability's tree. F10's DO waits until Hosting's suite is on `main` and synchronized under its own authorization.
