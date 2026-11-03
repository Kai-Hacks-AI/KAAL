# The review request

An invoker may supply any of these. Missing ones take the default.

| Field | Meaning | Default |
| --- | --- | --- |
| `subject` | repository, head, paths or pull request under review | required |
| `scope` | what is in and out | the subject |
| `lenses` | standards to review against, by source | none; review on plain correctness |
| `severity_floor` | lowest severity to list (`blocker`, `major`, `minor`, `nit`) | `nit` |
| `evidence_expected` | what a finding must show | observed where runnable |
| `checks` | commands to run, with expected exit status | none |
| `claims` | statements to test, each reported satisfied, failed or not shown | none |
| `independence` | who may review | not the author |
| `prior` | id of an earlier record to re-review | none |

A request carries no approval, merge or decision field, and cannot ask for evidence to be skipped. Unknown fields are reported, not obeyed. Findings below the floor are counted in `below_floor`, not listed.
