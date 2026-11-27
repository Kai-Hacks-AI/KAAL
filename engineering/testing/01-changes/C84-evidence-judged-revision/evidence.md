# C84 evidence

## Provenance

`origin/main` at `52b7c8d`, Node 22.23.4 in the sandbox. `testing/C82` (`observe-at`, the observation record) is on main. `testing/C83` (`mutate`) is in its collector and not on main; this Change does not depend on it and touches the same package files, so the second of the two to land takes a SYNC.

## 1. The defect, as it stands

Release/D20 (`engineering/release-management/00-changes/C165-record-judged-head/D20-record-binds-merge-commit.md`): on `pull_request`, `GITHUB_SHA` is the test merge commit of the run; check 1 recorded it as `sha` (#2816: head `d836d936`, record `d4751363`). Release repaired check 1 (C165), check 2 (C158) and check 4 (C159) each on its own line, pinned by `release/T1603`, `T1607` and `T1608`. Nothing common stops a fourth caller. Testing's observation record already makes every Case UNKNOWN when `revision` and `expectedRevision` differ (T411), and says nothing about why, and it accepts two equal strings that are not revisions.

## 2. RED on this PLAN tree

| Case | Tests | Result |
| --- | --- | --- |
| `testing/T420` | `testing/I52` | RED: `I52.md is absent` |
| `testing/T421` | `testing/F177` | RED: `F177.md is absent` |
| `testing/T422` | `testing/A63` | RED: `A63.md is absent` |
| `testing/T423` | `testing/F177` | RED: `lib/revision.mjs is absent` |
| `testing/T424` | `testing/F177` | RED: `lib/revision.mjs is absent` |
| `testing/T425` | `testing/F177` | RED: `lib/revision.mjs is absent` |

6 RED by assertion, 0 GREEN, 0 import or syntax errors. `collectCases('engineering/testing')` lists them with `parked: false` and no finding.

## 3. GREEN is reachable

With the three drafts placed (`KAAL_TESTING_DIR`), `T420` to `T422` are GREEN. A throwaway prototype (a pure `lib/revision.mjs` of about fifteen lines, four edited lines in `lib/observation.mjs`, two in the bin; not committed) turns `T423` to `T425` GREEN. With it, `T411` to `T413` and `test/observation.test.mjs` stay GREEN, so the existing record is unchanged where the revisions agree.
