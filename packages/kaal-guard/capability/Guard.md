---
name: Guard
type:
  name: KAAL Capability
  id: 56fe97bfa390114264f234bc3198103cb46da306736200af7bc47c0484bcf02e
---

# Guard

Guard is the responsibility for running a repository's own checks, for its Git hook and its CI, with one meaning per check: pass, fail, cannot judge, not applicable or held. It runs the checks a repository declares and the checks that sit beside the code they guard in a `kaal-guard.json`, and it judges nothing itself: what a check decides belongs to the check's owner, and which controls protect the delivery of the repository belongs to the repository's delivery tooling.
