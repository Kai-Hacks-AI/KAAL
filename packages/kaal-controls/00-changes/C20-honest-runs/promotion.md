# C20 promotion

1. PLAN and DO go into the collector `kaal/controls/honest-runs`, each by its own pull request, squashed. The collector is branched from `main`.
2. The DO needs no other open Change. It changes `evidence.mjs` where C18 also works and `stateLine` where C19 does: the second to land adapts.
3. ACT goes into the collector. The collector is promoted to `main` as one promotion, squashed, after a sync with `main` if it is behind, and the CPO's approval at its exact head.
4. KAAL's own use, `by` in the converter, is a separate Engineering Change.
