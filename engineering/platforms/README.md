# Platform evasion in tests

> PLAN (engineering/C9): nothing below exists yet. The Owner's direction on #641 (comment 6509987186), coordinated with Testing's #639, is to defend against two platform-specific ways a test can evade. This is a separate, bounded Engineering Change, because both checks reach beyond engineering/C7's packed-artifact harness. Approving this PLAN authorizes only its DO, on `kaal/engineering`.

## Why this is not C7

engineering/C7 (#641) runs one shipped package's installed verifier and judges it with testing/C29's cases. Within that run, testing/C29 already catches a declared case missing from the output, and an unsupported "not applicable".

These two checks are wider:

- They cover every test suite in the repository, the source suites as well as installed verifiers.
- They compare runs across Windows, macOS and Linux, which no single run can see.
- They read the test code itself, statically.

Adding them to C7 would enlarge its approved scope, so they stand here. Each consumes C7's per-platform observations where those exist, without changing C7.

## The two checks

- **engineering/F9. Inventory omission.** For each suite, Engineering takes the Test Case identities each platform's run *observed*. It reads them from a stated structured result: testing/C29's summary `cases` for a verifier, and `node --test --test-reporter=tap` or a structured reporter for a source suite, never the default output. It compares them with the identities the suite *declares*, and across the three platforms.
  - A case declared but not observed on a platform is a **finding** that names the case and the platform.
  - A case observed on one platform and missing on another is a finding too.
  - The comparison is deterministic: the same results always give the same findings.
- **engineering/F10. Conditional weakening.** Engineering scans the test code of every Capability except Hosting for platform indicators: `process.platform`, `os.platform()`, `win32`, `darwin`, `linux`, and their equivalents. That includes a conditional `skip`, `todo` or registration of a case, a changed expected outcome, and a branch that substitutes a trivial assertion for the real one, a trivial GREEN. Identical inventories across platforms do not clear these. Each match is **flagged for review**, naming the file, the line and the pattern. Matches do not fail automatically, because many are legitimate setup.
- **engineering/F11. What review decides.** A flagged match is resolved by human–agent validation, recorded with who judged, what and where. The question is whether platform-specific setup leaves the assertions intact and cannot give a false GREEN. Until it is validated, the match stays **unresolved**, visible on every run and never counted as passing.
- **engineering/N6. Hosting, and other exceptions.** Hosting exercises OS-specific semantics by design, so its tests are exempt from F10's flagging. They are not exempt from F9, because a Hosting case missing on one platform is still a finding. Any other Capability's exception needs an explicit justification and evidence, recorded beside the match. An exception without both stays unresolved.
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
| engineering/T18 | A conditional `skip`, a conditional expected value, and a platform branch around an assertion, each in a fixture outside Hosting, are flagged, naming file, line and pattern. The same code under Hosting is not flagged | One that scans for `skip` only |
| engineering/T19 | A flagged match without a validation record stays unresolved and is never counted as passing. With a record, it shows as validated, citing the record | One that treats flagged as passed |
| engineering/T20 | A "not applicable" case without a platform scope and a reason is a finding, and one with both is shown, never counted as passing | One that counts not applicable as passing |

## What stays as it is

Guard-quality consumer package tests stay at their bar. This Change adds findings and review, and it relaxes nothing. No test is skipped, rewritten or moved by Engineering.

Approving this PLAN authorizes the engineering/C9 DO only. It authorizes no synchronization, promotion or publication, no workflow change, and no Change in another Capability's tree.
