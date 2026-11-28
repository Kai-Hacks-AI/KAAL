# C84 evidence

## Provenance

`origin/main` at `52b7c8d`, Node 22.23.4 in the sandbox. `testing/C82` (`observe-at`, the observation record) is on main. `testing/C83` (`mutate`) is in its collector and not on main; this Change does not depend on it and touches the same package files, so the second of the two to land takes a SYNC.

## 1. The defect, as it stands

Release/D20 (`engineering/release-management/00-changes/C165-record-judged-head/D20-record-binds-merge-commit.md`): a record of check 1 named a revision that was not the one judged (#2816), and the same was found in check 2 (release/C158) and check 4 (release/C159). Release repaired each on its own line, pinned by `release/T1603`, `T1607` and `T1608`. Nothing common stops a fourth caller. Testing's observation record already makes every Case UNKNOWN when `revision` and `expectedRevision` differ (T411) and says nothing about why; it also accepts two equal strings that are empty or blank.

## 2. RED on this PLAN tree

| Case | Tests | Result |
| --- | --- | --- |
| `testing/T420` | `testing/I52` | RED: `I52.md is absent` |
| `testing/T421` | `testing/F177` | RED: `F177.md is absent` |
| `testing/T422` | `testing/A63` | RED: `A63.md is absent` |
| `testing/T423` | `testing/F177` | RED: `lib/identity.mjs is absent` |
| `testing/T424` | `testing/F177` | RED: `lib/identity.mjs is absent` |
| `testing/T425` | `testing/F177` | RED: `lib/identity.mjs is absent` |

6 RED by assertion, 0 GREEN, 0 import or syntax errors. `collectCases('engineering/testing')` lists them with `parked: false` and no finding.

## 3. GREEN is reachable

With the three drafts placed (`KAAL_TESTING_DIR`), `T420` to `T422` are GREEN. A throwaway prototype (a pure `lib/identity.mjs` of about ten lines and two edited lines in `lib/observation.mjs`; not committed) turns `T423` to `T425` GREEN. With it, `T411` to `T413` and `test/observation.test.mjs` stay GREEN, so the existing record is unchanged where the identities agree. The Cases use identities that are not Git ids (`tree:9f2c`, `sha256:9f2c4a`, `build-2026.11.27`), so nothing in the check depends on a source.
