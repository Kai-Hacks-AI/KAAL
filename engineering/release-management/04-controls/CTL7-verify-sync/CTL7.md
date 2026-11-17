---
id: release/CTL7
title: verify Sync
description: It reveals whether a SYNC is a pure merge of main, at its exact head.
type: detective
status: implemented
has: [release/I32]
---
# release/CTL7 verify Sync

A detective control. `verify Sync` reads a pull request titled `SYNC:` into `kaal/*`, `hotfix/*` or `wire/*` at its head and says whether it is a pure merge: a merge commit whose parents are the base's tip and a state already on `main` that is newer than the one the base incorporated, whose tree is exactly git's clean merge of those two parents, with no commit beyond the merge and a Reason stated. It says what it analyzed. A fact it cannot read is UNKNOWN, which never passes. It blocks nothing: a ruleset that required it would be another control with its own Owner decision.

It has one Intent, release/I32.
