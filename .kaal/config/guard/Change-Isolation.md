---
type: Guard/Check
command: bash engineering/github/change-isolation.sh
runs: [ci]
facts: [head, base, base-ref]
---

Change Isolation: Core travels alone and .github travels alone, decided from the changed paths (engineering/change-isolation/check.mjs). A failure names the paths that must move into a Change of their own.
