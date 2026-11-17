# C12 promotion

## Route

A PLAN never goes to `main` alone.

1. PLAN and DO go into the collector `kaal/controls/control-status`, each by its own pull request, squashed.
2. ACT goes into the collector, and the collector goes to `main` as one promotion, squashed, after the CPO approves at its exact head.

This PLAN authorizes no publication and no promotion.

## Smallest coherent promotion

Everything under `packages/kaal-controls/` and `engineering/controls/` that this Change adds or edits, and the one `status:` line of `release/CTL1` and of `release/CTL2` that release adds so that both are valid when the finder lands. No workflow, ruleset or required check changes.

## Evidence before promotion

| Kind | Evidence | Strength |
| --- | --- | --- |
| Structural | Cases T770 to T779 green, and the Cases of C8 and C9 still green with a status | verified by Cases |
| Validated | The CPO reads F19 to F24, N8 and A10 (and the amended Cases of C8 and C9) and A11 and judges that the four words are right, that Product and Engineering are kept apart, and that nothing more was added | judgment, not a Case |
| Operational | None. The check runs only inside a Case; nothing in GitHub requires it | not applicable |
