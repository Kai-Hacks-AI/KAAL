---
type: Guard/Check
command: bash engineering/github/branching.sh engineering/github/lineage.ts
runs: [ci]
facts: [head, base, base-ref]
trusted: engineering/github/lineage.ts
outcomes: {4: held}
---

A pull request lands on the lineage its base allows, judged by the base revision's engineering/github/lineage.ts (engineering/github/branching.md). Held (4) means it waits; the check's own output names what it waits for.
