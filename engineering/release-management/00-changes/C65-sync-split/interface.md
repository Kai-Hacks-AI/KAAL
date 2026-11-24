# C65 interface

Drafts as they are added in the DO. T850 to T855 read them. None of them is on the collector until the DO.

## Draft of I35.md

````
---
id: release/I35
title: the SYNC review reads the candidate only where no token can write
---
# release/I35 the SYNC review reads the candidate only where no token can write

Contract: the work that reads the commits of a SYNC runs where no token can write and no API is called; the work that can write to a pull request reads no commit of the candidate. It takes the verdict of the first as data and approves or asks a person only for the head and the base tip that verdict judged, as GitHub says they are now. A SYNC that changes what a script does still cannot reach a token.

Owner: release management.
````

## What the DO adds to the controls

`CTL7.md` gets `has: [release/I32, release/I35]` and this paragraph after its first:

````
Boundary. It reads the candidate's commits as Git data in a job that holds no token and calls no API, and runs nothing of the candidate. Its verdict is data for the jobs that can write.
````

`CTL8.md` gets `has: [release/I32, release/I33, release/I35]` and this paragraph after its Settings paragraph:

````
Boundary. It reads no Git object of the candidate. It takes the verdict of `verify Sync` as data, refuses one that is not a verdict `verify Sync` writes, and approves only when the head of the pull request and the tip of its base, read from GitHub just before, are the ones the verdict judged. The approval is attached to that head.
````

## The scripts

- `cli.mjs verify` reads no API. Its inputs are the environment (`KAAL_PR`, `KAAL_BASE`, `KAAL_HEAD`, `KAAL_BODY`, `KAAL_DEFAULT`) and Git objects the job fetched; its verdict is the output `verdict`.
- `approve.mjs` `readVerdict(verdict)` keeps only `control`, `outcome`, `passes` and `analyzed.head`, `analyzed.base.ref`, `analyzed.base.tip`, and returns null unless the control is `verify Sync` and the head and the base tip are full 40-character commit names. `decideApproveNow({ verdict, live, currentHead, mode, approvedAtHead })`, with `live = { head, baseTip }` from the API, skips when the verdict is not a verdict, when the live head or base tip is missing, when the head differs, or when the base tip differs; otherwise it decides as before.
- `cli.mjs approve` reads the pull request and the base's tip (`git/ref/heads/<base>`) through the API, never runs `git`, and attaches the approval to the head it read (`commit_id`).
- `review.mjs` `cleanVerdict(verdict)` keeps what review acts on and cuts every text that may reach a comment to plain characters (letters, digits, space and `.,'/*:()_-`), 40 characters for a code and 200 for a detail, 20 reasons at most; null when it is not a verdict of `verify Sync`. `cli.mjs review` never runs `git`: a verdict of another head than the current one is left to the run of that head; a pass whose base tip is no longer the live tip is read as FAIL with the reason `base-moved`, so a SYNC that fell behind still reaches a person.

## The workflow

`verify Sync` has `permissions: {}`, no `GH_TOKEN`, and is the only job that runs `git fetch` of the candidate (`refs/pull/N/head`). `approve Sync` and `review Sync` keep their permissions, check out the default branch only and run no `git fetch` and name no `refs/pull`. Their inputs from the event are the pull request number, the base ref, and the verdict (`needs.verify.outputs.verdict`).
