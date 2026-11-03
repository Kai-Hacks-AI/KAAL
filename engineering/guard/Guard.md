---
name: Guard
type:
  name: KAAL Capability
  id: 56fe97bfa390114264f234bc3198103cb46da306736200af7bc47c0484bcf02e
---

# Guard

Guard is the responsibility for connecting a repository's own checks to local Git hooks and to GitHub CI enforcement, so that a check means the same thing before a push and before a merge. It owns neither the checks, which are the repository's, nor what their evidence means, which is Testing's. It is not a general verification or policy framework.
