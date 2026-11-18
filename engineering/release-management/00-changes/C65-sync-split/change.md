# C65 change

## Because

Today the workflow is safe because it promises: the scripts never check out or run the candidate. That is a directive control. It holds while nobody changes the code, and nothing stops a later edit from breaking it. The token boundary makes the same safety preventive: a job that can write never sees the candidate, and the job that sees the candidate holds no token, so a candidate that could change what a script does still reaches nothing. CodeQL's `actions/untrusted-checkout` then enforces the boundary on every later edit, which the experiment #1887 showed it does for exactly this shape.

## From

All three jobs fetch the candidate and hold a token; approve and review judge again from Git objects.

## To

Only `verify Sync` fetches, with `permissions: {}` and no API; approve and review take its verdict as data and pin it to the live head and base tip.

## PLAN

1. Add the drafts of `interface.md` (the Intent, the additions to the two controls, the script contracts, the workflow shape) and the Cases T850 to T855, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no control item, no Intent item, no source, no workflow and no `.github` file, and changes no ruleset and no setting.

## Mechanism

- `verify` runs in a job with `permissions: {}`. It reads the pull request's head and body from the event, the candidate and the base's tip as Git objects it fetched, and main from its own checkout. It calls no API, so it needs no token.
- `approve` reads the pull request and the base's tip through the API, takes the verdict as data (strictly), and approves only the head and base tip that verdict judged, with `commit_id` of that head and only in live mode.
- `review` reads the verdict as data cut to plain characters, leaves a verdict of another head to the run of that head, and reads a pass whose base moved as FAIL (`base-moved`).
- Everything the old fresh re-judgment would have caught is caught by comparing two commit names: the head fixes its parents and tree, so a head that is the same commit judges the same; the base tip is the one input that changes under a SYNC, and it is read live.

## What it gives up

The old `approve` also re-read main's history before it approved. It does not now. The judged head holds a second parent that was a state of main when `verify Sync` ran; main's history only grows (its ruleset forbids non-fast-forward updates and its bypass list is empty), so that fact stays true. A Case that rewound main in a stand-in repository (part of release/T759) is dropped because the situation is not one the repository permits.

## Cases that move

Five existing Cases assert the shapes this Change deliberately changes and move with it in the DO: release/T750 and release/T751 (the controls equal their drafts, now with release/I35 and the Boundary paragraph), release/T759 (approve and review judge from the live head and base, not fresh Git facts), release/T791 and release/T792 (their stand-in GitHub also answers the base ref and `verify` takes the body from the environment), with the shared `fixtures.mjs` of release/C60. release/T757 and T793 stay as they are. Observed in the trial of the drafts (`evidence.md`).

## Ids

Change `release/C65`, Cases T850 to T859 (six used: T850 to T855), Intent `release/I35`, gap `release/G93`. No new control. Allocated by the coordinator on 17 Nov 2026.

## DO

On the go of the Owner, into the collector of this Change: add `01-intent/I35-sync-review-token-boundary/I35.md`, the changes to `approve.mjs`, `cli.mjs`, `review.mjs` and the workflow source, release/I35 in `has` of CTL7 and CTL8 and their Boundary paragraphs, all equal to the drafts. Rename T850 to T855 from `.red.mjs` to `.test.mjs` when green, and move the Cases named above.

## ACT

A 4L retrospective in `act.md`.

## Then

The new WIRE of `sync-review.yml` replaces the one in flight (#1885): CodeQL on it is the evidence that the boundary is read as clean by the real scanner. The WIRE is a separate step with the Owner's go.

## Left open

- The Cases check the shape CodeQL objected to (no job with a write token fetches the candidate). Only CodeQL itself on the installed copy shows that it is clean, which the WIRE's check run does.
- `verify Sync` calls no API in a job with no token, so it relies on the repository being public for its fetch. It was already so; a private repository would need another way.
