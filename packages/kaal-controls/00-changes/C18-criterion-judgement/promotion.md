# C18 promotion

1. PLAN and DO go into the collector `kaal/controls/criterion-judgement`, each by its own pull request, squashed. The collector is branched from `main`.
2. The DO waits for the C16 promotion, because it extends C16's state line. When C16 is on `main` the collector synchronizes with `main` before the DO.
3. ACT goes into the collector. The collector is promoted to `main` as one promotion, squashed, after a sync with `main` if it is behind, and the CPO's approval at its exact head.
4. KAAL's own use, writing `without` and `shows` in the converter and keeping judgements in a folder, is a separate Engineering Change.
