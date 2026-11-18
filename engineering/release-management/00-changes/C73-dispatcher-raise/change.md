# C73 change

## Because

Kai (18 Nov 2026): the PROMOTION is raised automatically when a collector's ACT merges, by a GitHub App named KAAL Dispatcher that plays the Worker role and has no authority of its own. It releases work to the next station when the work is ready and the seat is free; the seat and the priority are release/C75. This slice is the identity and the raise.

## From

A person or an agent raises each PROMOTION by hand; the rule that says when is only a function (release/C72).

## To

`gather.mjs` reads the facts of one collector through an injected API. `raise.mjs` reads a decision as data and makes the one write. `dispatch.mjs` is the command that wires both for the workflow. The workflow source `dispatcher.yml` runs on `schedule` and `workflow_dispatch`. `app-manifest.json` declares the App.

## Mechanism

- Job `decide` (`permissions: contents: read, pull-requests: read`, no App key): checks out the default branch, lists the collectors (`kaal/<capability>/<concern>`), gathers each one's facts with the workflow's read token, decides, and outputs the list of decisions as data. It checks out no collector and runs nothing of one.
- Job `raise` (`permissions: {}`, `needs: decide`): checks out the default branch, mints the installation token of the App with a pinned token action from `KAAL_DISPATCHER_APP_ID` and the secret `KAAL_DISPATCHER_KEY`, reads each decision strictly (`readDecision`), and for each `raise` makes `POST /repos/<repo>/pulls`. It does so only when `KAAL_DISPATCH_RAISE` is `on`; otherwise it prints `would-raise`.
- `readDecision` accepts only a collector name matching `kaal/<capability>/<concern>` as head, `main` as base, a title starting `PROMOTION: ` and cut to plain characters (at most 200), and a body cut the same way (at most 2000). Anything else is refused, so an ACT whose title or body was crafted cannot reach the call as anything but text.
- One at a time (the release thread's rule for the seat, release/I40 and T948): `decide` also reads the open pull requests into main (`GET pulls?state=open&base=main`), and `oneAtATime` turns every decision to raise into a skip (`seat-taken`) when any is open (an enqueued pull request is still open), and keeps only the first ready collector in a run. The next PROMOTION is raised only after the previous merge is seen on main, because its pull request is then no longer open. Which collector goes first, by HOTFIX, WIRE, KAAL priority, is release/C75.
- The only write the code can make is the creation of a pull request. No review, merge, auto-merge, push or label call exists in it.
- The App asks for `pull_requests: write`, `contents: write` (so the later slice can create the promote SYNC's branch) and `metadata: read`, takes no event and no webhook, and is not public.

## PLAN

1. Add the drafts of `interface.md` (Intent, source contracts, manifest, workflow shape) and the Cases T942 to T948, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source, workflow, manifest or `.github` file, no secret, no variable, and changes no ruleset and no setting.

## Ids

Change `release/C73`, Cases T942 to T951 (seven used: T942 to T948), Intent `release/I40`, gap `release/G96`. Agreed with the release thread on 18 Nov 2026.

## DO

On the go of the Owner, into the collector of this Change: add `01-intent/I40-dispatcher-only-raises/I40.md`, `05-src/promotion-raise/{gather,raise,seat,dispatch}.mjs`, `05-src/wiring/workflows/dispatcher.yml` and `05-src/promotion-raise/app-manifest.json`, all equal to the drafts. Rename T942 to T948 from `.red.mjs` to `.test.mjs` when green. The pinned commit of the token action is read and written in the DO.

## ACT

A 4L retrospective in `act.md`.

## Then

The WIRE installs `dispatcher.yml`, alone and with the Owner's go, after the Owner has created the App and stored `KAAL_DISPATCHER_KEY` and `KAAL_DISPATCHER_APP_ID`. The first live run is a dry run; `KAAL_DISPATCH_RAISE=on` is the Owner's second step, after a dry run shows what a person would have done. Release/C74 adds the promote SYNC and release/C75 the seat.

## Left open

- This session cannot read the commit of the token action's release; the DO reads it from its source before the pin is written.
- The pull request the Dispatcher raises needs auto-merge enabled and a first-run Branching toggle today; neither is this slice. A PROMOTION raised by an App still gets its checks, because an App token (unlike the workflow's own) starts workflows, which is the reason for the App.
- The facts that hide a collector (a PROMOTION already open, nothing ahead of main) are read from the API; main's tip and freshness are release/C74.
