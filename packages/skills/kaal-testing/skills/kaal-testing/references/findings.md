# Reference: findings

A finding is one of four kinds. Keep the kinds apart in every report, even when one problem produces several of them.

| Kind | What it is | What it rests on |
|---|---|---|
| **Verified failure** | A deterministic check failed on a named subject. | The check, the exact subject (the version or content checked), and the failing result. Running it again gives the same result. |
| **Potential defect** | Something may be wrong, and nothing has decided whether it is. | What was observed, and why it may be wrong. It awaits validation. |
| **Architectural concern** | A doubt about an architectural boundary or a duplicated responsibility. Its status is separate from its subject: suspected until validation decides it, then validated or dismissed. | What raised it, and its status. Once validated, the reasoning, named as judgment, and who made it. |
| **Unknown** | What lies outside the checks performed and the judgments made. | The stated coverage and exclusions of the checks, and anything skipped or not run. |

## Every finding names

- **its subject**: the capability, and the exact version or content examined;
- **where it is**: file and line, case name, or interface;
- **its evidence**: the check and its result, or the judgment and its reasoning.

## Moving between kinds

A potential defect becomes a verified failure only when a deterministic check reproduces it, and is dismissed only through recorded validation. A suspected architectural concern is validated or dismissed only through recorded validation; until then it is reported as suspected, never as judged. An unknown becomes one of the other kinds only when a check or a judgment covers it. Record the move and its evidence. Never just relabel a finding.

## A clean result

State what ran, on what subject, and within what coverage, then that it found nothing. For example: "The boundary check found no undeclared host module in the delivered modules. It does not inspect indirect host access; two constructs await validation." Never write "passes, so it is correct", and never omit what awaits validation or what was not covered.
