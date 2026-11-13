# C5 acceptance

Operational evidence the DO must collect before the old workflow is retired or a place is declared. Each row separates what is proposed from what is observed. **Observed** states what happened and where; nothing is claimed ahead of it. The behaviors of the interpreter are Cases (T87 to T89); the rows below need GitHub and are observations, not Cases.

| Id | Proposed test | Expected | Observed on 11 Nov 2026 |
| --- | --- | --- | --- |
| A1 | A throwaway pull request into a scratch collector adds a dependency with a known advisory | the new job fails, the record is FAIL naming dependency, version, advisory, severity; the old job fails too | **Observed on 12 Nov 2026**, throwaway PR #1459 into the collector (closed unmerged): `minimist` 0.0.8 as a runtime dependency. The new job returned FAIL with two findings (GHSA-xvch-5gv4-984h critical, GHSA-vh95-rmgr-6w4m moderate) and exit 1; the old job failed too. |
| A2 | The same throwaway pull request with the dependency data made unavailable, for example a repository fork with the dependency graph disabled | the job fails, the record is UNKNOWN, never PASS | not observed |
| A3 | A pull request that adds nothing vulnerable, into a scratch collector and into the scratch default branch | the check result appears once under the declared name and is green; no second, skipped result beside it | **Partly observed on 12 Nov 2026**: on real pull requests into the collector (#1426, #1453, and #1459 with a development dependency) the result `analyze Vulnerabilities (Integration)` appears once and is green. Not observed: a pull request into the default branch. |
| A4 | A scratch promotion through a scratch merge queue with the control declared | the check result appears on the merge group commit under the declared name, with the outcome of the group | not observed |
| A5 | The last 30 pull requests the old job analyzed, replayed through the new job | every outcome equals the old one (all PASS) | the old job: 30 of 30 success; the replay is absent |
| A6 | The checks list of a pull request is read with the control | the order of the list follows "workflow / job" | not observed |
| A7 | A throwaway pull request adds a known-vulnerable dependency as a development dependency | stated, not assumed: whether the control analyzes it | **Observed on 12 Nov 2026**, same PR #1459, first commit: `minimist` 0.0.8 under `devDependencies` passed in the new and the old job. The pinned action filters on scope and counts runtime dependencies only unless configured. This is a coverage limit of the retained realization, in the same class as the existing-inventory gap in `analysis-realization.md`; the control's contract is not narrowed and the policy is not changed here. |

## Consequences when something is not observed

- A1 is observed. A2 is still open, and retirement waits for it.
- If A4 is not observed, Promotion IN is not declared for the control and no promotion binding is proposed. The scope of the control is then Integration IN alone, stated as such, and the second look at promotion is reported as not covered.
- If A1 or A2 is not observed, the control is not declared for any place. Retirement waits.
