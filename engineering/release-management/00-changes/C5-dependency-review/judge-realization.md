# C5 judge realization

How the retained mechanism, the pinned `actions/dependency-review-action` (v5.0.0, `a1d282b`), realizes F7. Each line says how it is known. **Read** means read from the action's source at that SHA on 11 Nov 2026. **Observed** means seen running. **Proposed** is what the DO must realize. Nothing below is observed running yet except the old job's 30 successful runs.

| Behavior | Fact | How known |
| --- | --- | --- |
| What is compared | Dependencies added or changed between a base and a head, via GitHub's dependency comparison, against its Advisory Database | Read; the old job is observed doing this on 30 pull requests, all success |
| PASS | The comparison succeeded, the `vulnerable-changes` output is an empty list, the job succeeds | Read |
| FAIL | The comparison succeeded and found a vulnerable change: the output is set to a JSON list of changes with their advisories and severities and the job is failed | Read; a failure is not yet observed (E2) |
| Severity in force | `fail-on-severity` has no default in `action.yml`, and its schema defaults to `low`, so any advisory fails. The old workflow sets none. License, deny-list and scope checks are off unless configured, and `warn-only` is unset | Read |
| UNKNOWN | Any error of the comparison (404 dependency graph unavailable, 403, anything unexpected) fails the job and sets no output. The job's exit status is therefore the same as for FAIL | Read; not observed |
| Distinguishing FAIL from UNKNOWN | The action does not. A FAIL has a `vulnerable-changes` output and an UNKNOWN has none | Read |
| Result name | The check result carries the job's name | Observed on GitHub |
| `merge_group` | The pinned source takes the base and head from `merge_group.base_sha` and `head_sha` when no refs are given, so it can judge a merge group | Read; **not observed** on a merge group |
| Snapshot warnings | The action can report an incomplete dependency snapshot and can retry; whether a warning is a verdict of its own is not established | Read; open |

## What the DO must realize (proposed)

- The job runs the action with the retained policy, records its outcome and its `vulnerable-changes` output even when the action fails, and passes both to the judge A25.
- The judge returns FAIL naming each dependency, version, advisory and severity when the output lists changes. It returns UNKNOWN when the action failed and gave no output, and when the output cannot be read. It returns PASS only for a successful outcome with an empty list.
- Both FAIL and UNKNOWN fail the job. The check result is the same either way and the record distinguishes them.
- Until a merge group has been observed to be judged (`acceptance.md` A4), Promotion IN is not declared for the control and no promotion binding is proposed.
