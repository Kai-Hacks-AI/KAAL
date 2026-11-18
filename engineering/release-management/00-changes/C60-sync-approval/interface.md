# C60 interface

Drafts as they are added in the DO. T790 to T793 read them. None of them is on the collector until the DO.

## Draft of I33.md

````
---
id: release/I33
title: a refused SYNC approval names its setting and reaches a person
---
# release/I33 a refused SYNC approval names its setting and reaches a person

Contract: when the approval of a pure SYNC is refused because Actions may not approve, the finding names the setting that is off, and the SYNC is put in front of a person like any other SYNC that needs one, so a pure SYNC never waits unnoticed for an approval that cannot come. Any other failure of the approval stays an unnamed failure and is never read as that setting.

Owner: release management.
````

## What the DO adds to the controls

`CTL8.md` and `CTL9.md` get `has: [release/I32, release/I33]`. `CTL8.md` gets this paragraph after its first:

````
Settings. It approves only where the repository setting "Allow GitHub Actions to create and approve pull requests" is on (the organization can block it) and the repository variable `KAAL_SYNC_APPROVE` is `on`; `05-src/sync-review/settings.json` declares both. When the first is off, a live run fails with a finding that says so. It is Running once a live run has approved a SYNC, shown by an APPROVED review of `github-actions[bot]` on a SYNC head.
````

## The classification and the output

`classifyRefusal(message)` returns `actions-not-permitted` when the message says that GitHub Actions is not permitted to approve pull requests, in any case, and `other` for every other text, including an empty one.

`cli.mjs approve` writes the output `approval` as `approved` (the call succeeded), `would-approve` (dry run), `refused` (class `actions-not-permitted`) or `skipped` (every other decision). For `refused` it reports `::error title=approve Sync: Actions may not approve::` naming "Allow GitHub Actions to create and approve pull requests" and the organization, and exits 1. A failure of class `other` throws as before and writes no `approval`.

## The escalation

`decideReview({ verdict, currentHead, existing, approval })`: a passing verdict with `approval` equal to `refused` gives `label`, `comment` and `request-review`, each left out when `existing` shows it done for the current head; the comment carries the marker `<!-- review-sync:<head> -->` and a line saying the approval was refused. A passing verdict with any other `approval` gives nothing, or `unlabel` when the label is on. A verdict that is not a pass is unchanged. `cli.mjs review` reads `KAAL_APPROVAL`.

## settings.json

`05-src/sync-review/settings.json`:

````
{
  "control": "release/CTL8",
  "settings": [
    { "id": "actions-may-approve", "name": "Allow GitHub Actions to create and approve pull requests", "where": "repository setting; the organization can block it", "value": true, "neededFor": "live" },
    { "id": "KAAL_SYNC_APPROVE", "name": "KAAL_SYNC_APPROVE", "where": "repository variable", "value": "on", "neededFor": "live", "otherwise": "dry run" }
  ],
  "running": "an APPROVED review by github-actions[bot] on the head of a SYNC"
}
````

## The workflow

`approve Sync` has the job output `approval` from its step. `review Sync` has `needs: [verify, approve]`, still runs through `always()` when `approve` failed, and passes `KAAL_APPROVAL: ${{ needs.approve.outputs.approval }}`.
