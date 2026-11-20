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
- Idempotency per candidate state (CPO, 18 Nov 2026; release/I40, T949). The candidate state is the collector name plus its tip revision. Every raised pull request carries a marker line `<!-- kaal-dispatch: <collector>@<tip> -->` appended by `raiseAll`, never taken from the decision's text. Raising is safe under overlap and retry by two mechanisms that do not depend on each other. (1) The atomic one: GitHub keeps at most one open pull request per head and base, so of two concurrent `POST /pulls` for the same collector exactly one succeeds and the other is refused with 422 "A pull request already exists"; `raiseAll` takes exactly that refusal as the answer `exists`, not as a failure, and does not retry. Every other failure (another 422, 5xx) is thrown, never swallowed. (2) The look before the creation (`GET pulls?state=all&head=<owner>:<collector>&base=main`) finds a pull request of the same marker in any state, open, closed or merged, and answers `already-raised` without a write; this covers a run that made the PROMOTION and lost the answer, and a PROMOTION that was closed on purpose, which is not raised again until the collector moves to a new tip. The look is an optimisation and a guard for closed states; correctness under the race rests on (1). Freshness at the write boundary (CPO, 18 Nov 2026; T950): the decision carries the tip revision it evaluated (`withRevision` in `dispatch.mjs`). `POST /pulls` names a branch, which GitHub offers no way to pin to a commit, and the Dispatcher may not push a branch of its own at that SHA (that is `contents: write`, which it does not have and this slice does not ask for). So the guarantee is in two steps. Before: right before the POST, after the look, `raiseAll` reads `GET git/ref/heads/<collector>` and, when the tip is not the evaluated revision (or cannot be read), makes no write and answers `moved`; the next run decides again from the new facts. After: the pull request GitHub returns carries `head.sha`; when it is not the evaluated revision the result is `raised-moved` with both revisions and the number, and the job fails visibly. No second write repairs it. What remains is a window of milliseconds between the reading and the POST, and it is closed by the gate, not by the Dispatcher: the PROMOTION is only a proposal, and its review, its CPO approval and its checks bind to the head SHA of the pull request, so approval is never given for a revision nobody evaluated. The workflow's `concurrency` group (`dispatch`, no cancel) narrows overlap but is not relied on.
- The seat is a policy, not an architectural invariant (CPO, 18 Nov 2026). `seat.mjs` holds `oneAtATime({ decisions, openPromotions, capacity })` and `readCapacity(value)`: default capacity 1, read from the variable `KAAL_DISPATCH_CAPACITY` (a whole number 1 to 9, anything else means 1). While `openPromotions` (every open pull request into main, since an enqueued one is still open) plus the raises of this run would exceed the capacity, a raise becomes a skip (`seat-taken`). Global serialization of runs is not required and is not built. Queue capacity belongs to release/C89 and the ordering HOTFIX, WIRE, KAAL to release/C75; duplicate prevention belongs here.
- The only write the code can make is the creation of a pull request. No review, merge, auto-merge, push or label call exists in it.
- The App asks for `pull_requests: write` and `metadata: read` and nothing else (CPO, 18 Nov 2026: least privilege; `contents: write` for the promote SYNC of release/C74 is asked for when that slice is reviewed and approved), takes no event and no webhook, and is not public.

## PLAN

1. Add the drafts of `interface.md` (Intent, source contracts, manifest, workflow shape) and the Cases T942 to T950, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source, workflow, manifest or `.github` file, no secret, no variable, and changes no ruleset and no setting.

## Ids

Change `release/C73`, Cases T942 to T951 (nine used: T942 to T950), Intent `release/I40`, gap `release/G96`. Agreed with the release thread on 18 Nov 2026.

## DO

On the go of the Owner, into the collector of this Change: add `01-intent/I40-dispatcher-only-raises/I40.md`, `05-src/promotion-raise/{gather,raise,seat,dispatch}.mjs`, `05-src/wiring/workflows/dispatcher.yml` and `05-src/promotion-raise/app-manifest.json`, all equal to the drafts. Rename T942 to T950 from `.red.mjs` to `.test.mjs` when green. The pinned commit of the token action is read and written in the DO.

## ACT

A 4L retrospective in `act.md`.

## Then

The WIRE installs `dispatcher.yml`, alone and with the Owner's go, after the Owner has created the App and stored `KAAL_DISPATCHER_KEY` and `KAAL_DISPATCHER_APP_ID`. The first live run is a dry run; `KAAL_DISPATCH_RAISE=on` is the Owner's second step, after a dry run shows what a person would have done. Release/C74 adds the promote SYNC and release/C75 the seat.

## Left open

- This session cannot read the commit of the token action's release; the DO reads it from its source before the pin is written.
- The pull request the Dispatcher raises needs auto-merge enabled and a first-run Branching toggle today; neither is this slice. A PROMOTION raised by an App still gets its checks, because an App token (unlike the workflow's own) starts workflows, which is the reason for the App.
- The facts that hide a collector (a PROMOTION already open, nothing ahead of main) are read from the API; main's tip and freshness are release/C74.
