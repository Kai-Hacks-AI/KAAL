# Cross-platform inventory parity

> PLAN (engineering/C9): nothing below exists yet. The Owner's direction on #641 (comments 6509987186 and 6510003813), coordinated with Testing's #639, is to defend against platform-specific ways a test can evade. This Change takes the first: a declared Test Case that is missing on one platform. The second, conditional weakening of tests and code by OS, is a boundary concern. Per the Owner's later comments (6510106826 and 6510155607), Hosting owns that Boundary Test Suite and Engineering composes it in its Boundary Test Plan, engineering/C10. Both are separate from engineering/C7's packed-artifact harness. Approving this PLAN authorizes only its DO, on `kaal/engineering`.

## Why this is not C7

engineering/C7 (#641) runs one shipped package's installed verifier and judges it with testing/C29's cases. Within that run, testing/C29 already catches a declared case missing from the output, and an unsupported "not applicable".

This check is wider. It covers every test suite in the repository, the source suites as well as installed verifiers, and it compares runs across Windows, macOS and Linux, which no single run can see. Adding it to C7 would enlarge C7's approved scope. It consumes C7's per-platform observations where those exist, without changing C7.

## What the DO does

- **engineering/F9. Inventory omission.** For each suite, Engineering takes the Test Case identities each platform's run *observed*. It reads them from a stated structured result: testing/C29's summary `cases` for a verifier, and `node --test --test-reporter=tap` or a structured reporter for a source suite, never the default output. It compares them with the identities the suite *declares*, and across the three platforms.
  - A case declared but not observed on a platform is a **finding** that names the case and the platform.
  - A case observed on one platform and missing on another is a finding too.
  - The comparison is deterministic: the same results always give the same findings.
  - Identical inventories are necessary, not sufficient. A test that branches by OS to weaken its assertions, skip meaningful behaviour or substitute a trivial GREEN keeps its inventory intact. That is found by Hosting's Boundary Test Suite in engineering/C10, not here.
- **engineering/N6. No exemption.** Hosting's cases are not exempt: a Hosting case missing on one platform is a finding like any other.
- **engineering/N7. "Not applicable" is accountable.** A case that is not applicable on a platform must show its applicability: the platforms in its scope and its reason, as testing/F47 defines. It is reported visibly, justified independently of the case's own code, and never counted as passed.

## Dependencies

| Prerequisite | Owner | Kind | State |
| --- | --- | --- | --- |
| The observable result, Test Case identity and applicability semantics | Testing | Semantic reference. The DO also calls `kaal-testing/verifiers` to read verifier summaries | Planned in testing/C29 (#639) |
| Declared case inventories for source suites | Each Capability, in its own suite | Semantic reference: Engineering reads what each suite declares and writes nothing in it | Today only verifiers declare one (testing/C29's manifest). For a source suite without one, F9 compares platforms against each other only, and says so |
| Per-platform runs | Engineering's lanes, in CI | Delivery: running the lanes on three platforms is a `.github/` Change of its own | Hosting and Acceptance run on three platforms today. The Workspaces lane is Linux-only |
| Installed-verifier observations | engineering/C7 (#641) | Order: F9 uses them once C7 lands | Planned |

## Test Cases

These go in `engineering/platforms/platforms.test.mjs`, on fixtures in a scratch directory. Each is first observed RED against a deliberately wrong implementation.

| Test | Checks | Deliberately wrong implementation that makes it RED |
| --- | --- | --- |
| engineering/T16 | A fixture case registered only `if (process.platform !== "win32")` is reported missing on Windows, naming the case | One that compares only the counts per platform |
| engineering/T17 | Identical results on three platforms give no finding, and the same input always gives the same findings | One that orders findings by arrival |
| engineering/T20 | A "not applicable" case without a platform scope and a reason is a finding, and one with both is shown, never counted as passing | One that counts not applicable as passing |

engineering/T18 and T19 are not used. The boundary checks they planned are engineering/C10's.

## What stays as it is

Guard-quality consumer package tests stay at their bar. This Change adds findings, and it relaxes nothing. No test is skipped, rewritten or moved by Engineering.

Approving this PLAN authorizes the engineering/C9 DO only. It authorizes no synchronization, promotion or publication, no workflow change, and no Change in another Capability's tree.
