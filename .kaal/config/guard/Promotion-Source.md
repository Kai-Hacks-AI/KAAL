---
type: Guard/Check
command: bash engineering/github/promotion-source.sh engineering/github/lineage.ts
runs: [ci]
facts: [base, base-ref]
trusted: engineering/github/lineage.ts
outcomes: {"4": held}
---

A promotion into main comes only from a kaal/<capability>/*, hotfix/* or wire/* branch of this repository whose own rulesets' required checks are all green on its exact head, judged by the base revision's engineering/github/lineage.ts. Held (4) means the promotion waits; the check's own output names what it waits for.
