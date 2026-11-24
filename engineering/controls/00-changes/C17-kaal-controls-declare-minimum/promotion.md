# C17 promotion

1. PLAN and DO go into the collector `kaal/controls/kaal-minimum-evidence`, each by its own pull request, squashed. The collector is branched from `main`.
2. ACT goes into the collector. The collector is promoted to `main` as one promotion, squashed, after a sync with `main` if it is behind, and the CPO's approval at its exact head. Release reviews the PLAN and the DO because they touch its controls and Cases.
3. It is promoted independently of controls/C16.
