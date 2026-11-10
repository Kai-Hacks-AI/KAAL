# Cases

The Cases of the target (B). The Cases of the migration (A to B) are in `../00-changes/cases.md`.

| Case | Intent | Requirement | Architecture | Defect | Checks |
| --- | --- | --- | --- | --- | --- |
| release-management/F15/T1 | I1 | F15 | the control row F15, component `rulesets/` | release-management/D1 | the effective rules GitHub reports for a collector branch include a `pull_request` rule with approval of the most recent push, supplied by a ruleset other than `legacy-integration`; the Case moves next to its code in `05-src/rulesets/` with the DO |
