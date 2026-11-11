# C5 acceptance

Operational evidence the DO must collect before the old workflow is retired or a place is declared. Each row separates what is proposed from what is observed. **Observed** states what happened and where; nothing is claimed ahead of it. The behaviors of the judge are Cases (T87 to T89); the rows below need GitHub and are observations, not Cases.

| Id | Proposed test | Expected | Observed on 11 Nov 2026 |
| --- | --- | --- | --- |
| A1 | A throwaway pull request into a scratch collector adds a dependency with a known advisory | the new job fails, the record is FAIL naming dependency, version, advisory, severity; the old job fails too | not observed |
| A2 | The same throwaway pull request with the dependency data made unavailable, for example a repository fork with the dependency graph disabled | the job fails, the record is UNKNOWN, never PASS | not observed |
| A3 | A pull request that adds nothing vulnerable, into a scratch collector and into the scratch default branch | the check result appears once under the declared name and is green; no second, skipped result beside it | not observed |
| A4 | A scratch promotion through a scratch merge queue with the control declared | the check result appears on the merge group commit under the declared name, with the verdict of the group | not observed |
| A5 | The last 30 pull requests the old job judged, replayed through the new job | every verdict equals the old one (all PASS) | the old job: 30 of 30 success; the replay is absent |
| A6 | The checks list of a pull request is read with the control and with the aggregates | the order of the list follows "workflow / job" | not observed |

## Consequences when something is not observed

- If A4 is not observed, Promotion IN is not declared for Dependency Review and no promotion binding is proposed. The scope of the control is then Integration IN alone, stated as such, and the second look at promotion is reported as not covered.
- If A1 or A2 is not observed, the control is not declared for any place. Retirement waits.
