# C81 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, Requirement, Architecture, the amended control and the two settings) and the Cases T1042 to T1045, all RED.
2. Observe the expected RED, and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN changes no ruleset source, no `stages.json`, no control, no workflow, nothing under `.github`, no live ruleset and no setting.

## Mechanism

Two settings change in the DO and one control text: `required_review_thread_resolution` goes false to true in `integrating.json` and in the `Integrating` declaration of `stages.json`, and release/CTL10 gains the Intent release/I46. `verify Stages` already judges a declared setting against the source and a declared control against the controls, so a mismatch between the source and the declaration is a finding without a change to the judge. T1042 covers the chain (control to Intent, Requirement `serves`, Architecture `addresses`), T1043 the source, T1044 the declaration and the judge, T1045 the bot boundary.

## What follows when it is live

- A reviewer's open thread blocks the merge until someone resolves it. On a PR with a bot approval only (a pure SYNC) there is no thread, so nothing changes for a SYNC.
- A bot never opens a thread. The boundary is stated in release/I46 and release/CTL10 and checked by T1045 against the workflows, so a later bot (the Inspector) that wants to speak uses a comment or a check.
- The old integration ruleset keeps the same setting until its approval rule is removed, after this one is proven equivalent. The old promotion ruleset (24951062) also requires thread resolution on `main`; that is a separate control and Change.
- Installing is the Owner's, by hand, with the rest of CTL10. Nothing is loaded here.

## Old Cases the DO amends

release/T860 (in `04-controls/CTL10-approve-integration`) asserts `has` equals `['release/I36']` and that `CTL10.md` equals the C66 draft, and release/T862 asserts `integrating.json` equals the C66 draft. Both fail with the drafts (observed in `evidence.md`) and are amended in the DO to read the current draft (this Change's), never skipped, one at a time. release/T864 matches phrases that stay in the control text and keeps passing.

## Ids

Change `release/C81`, Intent `release/I46`, Requirement `release/F63`, Architecture `release/A58`, Gap `release/G104`, Cases T1042 to T1051 (four used). No new control: release/CTL10 gains an Intent. Reserved by the release thread on 18 Nov 2026.

## DO

Not authorized by this PLAN. On the merged PLAN, into the collector `kaal/release/thread-resolution`: add `I46.md`, `F63.md`, `A58.md`, amend `CTL10.md`, change the two settings, amend T860 and T862 to the new draft, rename T1042 to T1045 from `.red.mjs` to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md`.

## Left open

- The old promotion ruleset's thread resolution on `main` has no new owner.
- Whether CTL10's loading timing (after the sync bot's first live approval) changes: no, a bot SYNC carries no thread.
