---
type: Guard/Check
command: node engineering/github/promotion-source.mjs engineering/github/lineage.ts
runs: [ci]
facts: [base, base-ref]
trusted: engineering/github/lineage.ts
outcomes: {"4": held}
---

A promotion into main comes only from a kaal/* lineage, judged by the base revision's engineering/github/lineage.ts. Held (4) means the promotion waits; the check's own output names what it waits for.
