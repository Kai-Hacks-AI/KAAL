# C130 evidence

The persistence evidence of decision 3(b): for each of the next ten pull requests that touch `.github/workflows`, the run's `previous`, findings and verdict. The accepted baseline is Git itself, so it persists only when every merge into the base passed the check. A merge that moved the baseline up without a PASS is a Defect and restarts the count.

Nothing is recorded yet: the judge on the base is the old one until a WIRE installs the new one, and the `promoting` ruleset that requires `verify Triggers` is loaded (CPO, 23 Nov: ruleset 30, promoting, 27596975). The first row is written by the first pull request that touches a workflow after the WIRE.

| Pull request | previous | findings | verdict | next |
| --- | --- | --- | --- | --- |
| | | | | |

## Fixtures

The lifecycle on fixtures, with its limit, is Case T1409: an accepted run stores its next, a rejected run stores none, an improvement shrinks the allowance, a rollback is growth, and a base that gained a use by a merge that skipped the check is not seen by the judge.
