---
type: Guard/Check
command: sh engineering/github/push-check.sh
runs: [local]
facts: [head, base, base-ref]
---

KAAL's local push judgment: the branching policy and Change Isolation for each pushed ref, before CI sees it. Its rules, verdicts and guidance are in engineering/github/lineage.ts, engineering/change-isolation/check.mjs and engineering/github/branching.md. A failure names the rule; fix the branch or its target, then push again.
