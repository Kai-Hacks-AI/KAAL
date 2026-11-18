---
id: release/CTL7
title: verify Sync
description: It reveals whether a SYNC is a pure merge of main, at its exact head.
type: detective
has: [release/I32, release/I35]
---
# release/CTL7 verify Sync

A detective control. `verify Sync` reads a pull request titled `SYNC:` into `kaal/*`, `hotfix/*` or `wire/*` at its head and says whether it is a pure merge: a merge commit whose parents are the base's tip and a state already on `main` that is newer than the one the base incorporated, whose tree is exactly git's clean merge of those two parents, with no commit beyond the merge and a Reason stated. It says what it analyzed. A fact it cannot read is UNKNOWN, which never passes. It blocks nothing: a ruleset that required it would be another control with its own Owner decision.

Boundary. It reads the candidate's commits as Git data in a job that holds no token and calls no API, and runs nothing of the candidate. Its verdict is data for the jobs that can write.

It has one Intent, release/I32.
