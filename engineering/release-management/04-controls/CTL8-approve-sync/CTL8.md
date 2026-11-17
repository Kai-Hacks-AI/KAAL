---
id: release/CTL8
title: approve Sync
description: It gives a SYNC the approval it needs only when verify Sync passes at its exact head.
type: preventive
has: [release/I32, release/I33]
---
# release/CTL8 approve Sync

A preventive control. A SYNC lands only with an approval at its head. `approve Sync` is the one approval that is not a person's: it approves a SYNC when `verify Sync` passes at the current head of that pull request, read again just before it acts, and for nothing else. It never approves a pull request into `main`, never merges and never edits a branch. It runs as a dry run, saying what it would approve, until the Owner turns it on. Its approval counts only where the base's rules do not require a Code Owner review.

Settings. It approves only where the repository setting "Allow GitHub Actions to create and approve pull requests" is on (the organization can block it) and the repository variable `KAAL_SYNC_APPROVE` is `on`; `05-src/sync-review/settings.json` declares both. When the first is off, a live run fails with a finding that says so. It is Running once a live run has approved a SYNC, shown by an APPROVED review of `github-actions[bot]` on a SYNC head.

It has one Intent, release/I32. It uses release/CTL7 and is a second control, not a part of it.
