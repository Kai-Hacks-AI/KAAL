# C100 baseline

The baseline is `main` (4479d00), with no commit of this Change.

- The old promotion ruleset 24951062 holds `deletion` and `non_fast_forward` on `main`. Nothing in the repository defines either as a control: they have no Intent, no classification, no judge and no Cases. The legacy mapping found no control for them.
- The new promoting ruleset 27596975 does not hold them.
- No check reveals a rewritten `main` after the fact.
