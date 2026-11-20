# C15 promotion

1. PLAN and DO go into the collector `kaal/controls/minimum-evidence`, each by its own pull request, squashed. The collector is branched from `main`.
2. ACT goes into the collector. The collector is promoted to `main` as one promotion, squashed, after a sync with `main` if it is behind, and the CPO's approval at its exact head.
3. The Engineering Change that uses this one is planned after this PLAN is approved and may be raised in parallel. It is promoted after this one.
