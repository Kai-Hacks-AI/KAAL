# release-management/D1: a two-level collector is merged into without approval or checks

- **id:** release-management/D1
- **expected:** F15. A pull request into a collector is not merged without an approval of its most recent push.
- **observed:** #1381 was merged into `kaal/release/approve-change` on 10 November 2026 with `Branching` red and no recorded review. `kaal/release/<name>` has no rule behind it: the ruleset `integration` includes `refs/heads/kaal/**`, which does not reach two-level branches (`GET /rules/branches/kaal%2Frelease%2Fplan` returned no rules).
- **where:** the ruleset `integration` (24952357), `conditions.ref_name.include`.
- **status:** confirmed
- **tests:** release-management/F15/T1
