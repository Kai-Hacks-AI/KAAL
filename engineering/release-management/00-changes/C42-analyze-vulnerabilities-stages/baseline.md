# C42 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality.

- On `main`: release/C5, the capability (I4, F7, the interpreter and adapter in `05-src/vulnerability-analysis/`, Cases T87 to T90), ruleset set 1 sources (`05-src/wiring/rulesets/`, six rulesets), the stage judge and `verify Stages (<Stage>)` jobs (release/C35, C37).
- On `main`, unchanged: `.github/workflows/dependency-review.yml`, one detective job `Dependency Review`, pull_request only, no merge_group.
- Not on `main`: the release/C18 workflows, Guard declaration and Cases T82, T83, T202 to T205. They sit on two collectors 30 commits behind `main`, target the old Integration and Promotion names and are superseded by this Change.
- Live: three old rulesets (active) and the six set 1 rulesets, each with only its `verify Stages` check.
