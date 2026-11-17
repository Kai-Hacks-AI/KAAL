---
id: release/CTL8
title: approve Sync
description: It gives a SYNC the approval it needs only when verify Sync passes at its exact head.
type: preventive
status: implemented
has: [release/I32]
---
# release/CTL8 approve Sync

A preventive control. A SYNC lands only with an approval at its head. `approve Sync` is the one approval that is not a person's: it approves a SYNC when `verify Sync` passes at the current head of that pull request, read again just before it acts, and for nothing else. It never approves a pull request into `main`, never merges and never edits a branch. It runs as a dry run, saying what it would approve, until the Owner turns it on. Its approval counts only where the base's rules do not require a Code Owner review.

It has one Intent, release/I32. It uses release/CTL7 and is a second control, not a part of it.
