---
type: Guard/Check
command: bash engineering/github/branching-audit.sh engineering/github/lineage.ts
runs: [ci]
facts: [base]
trusted: engineering/github/lineage.ts
outcomes: {4: held}
---

The audit of every open lineage against the branching policy, judged by the base revision's engineering/github/lineage.ts. Held (4) means the Owner holds a finding (engineering/github/holds.json); the check's own output names it.
