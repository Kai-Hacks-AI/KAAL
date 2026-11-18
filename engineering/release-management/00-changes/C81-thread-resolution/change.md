# C81 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, Requirement, Architecture, the amended control and the two settings) and the Cases T1042 to T1047, all RED.
2. Observe the expected RED, and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN changes no ruleset source, no `stages.json`, no control, no workflow, nothing under `.github`, no live ruleset and no setting.

## Mechanism

Two settings change in the DO and one control text: `required_review_thread_resolution` goes false to true in `integrating.json` and in the `Integrating` declaration of `stages.json`, and release/CTL10 gains the Intent release/I46. `verify Stages` already judges a declared setting against the source and a declared control against the controls, so a mismatch between the source and the declaration is a finding without a change to the judge.

## Placement of the Cases

A Case that asserts the end state of an element sits beside that element, `.red.mjs` until green, and reads the element's own properties, never a draft of this Change. A Case about this Change's own gap and obligation stays in this folder.

| Case | Tests | Sits in | Asserts |
| --- | --- | --- | --- |
| T1042 | release/CTL10 | `04-controls/CTL10-approve-integration` | CTL10 has I36 and I46 and states the thread requirement; F63 serves I46, A58 addresses F63 |
| T1043 | release/F63 | `02-requirements/F63-thread-resolution` | the `integrating` source requires thread resolution for the three targets, no bypass |
| T1044 | release/A58 | `03-architecture/A58-thread-resolution` | the declaration states the same setting, the judge passes, a source that disagrees is a finding |
| T1045 | release/I46 | `01-intent/I46-thread-resolution` | the Intent states the thread contract and the bot boundary; no workflow creates an inline review thread |
| T1046 | release/G104 | this folder | the gap is closed: thread resolution on where the recorded baseline (`baseline.md`, From) had it off, every other setting equal |
| T1047 | release/C81 | this folder | the DO's obligation: T860 and T862 still exist, are not skipped and read the current target, not the C66 draft |

T1046 and T1047 are the change-semantic Cases and retire at the ACT. The element folders hold only a `.red.mjs` until the DO adds the element file; the finders, the runner and `verify Stages` ignore it (observed in `evidence.md`).

## What follows when it is live

- A reviewer's open thread blocks the merge until someone resolves it. On a PR with a bot approval only (a pure SYNC) there is no thread, so nothing changes for a SYNC.
- A bot never opens a thread. The boundary is stated in release/I46 and release/CTL10 and checked by T1045 against the workflows, so a later bot (the Inspector) that wants to speak uses a comment or a check.
- The old integration ruleset keeps the same setting until its approval rule is removed, after this one is proven equivalent. The old promotion ruleset (24951062) also requires thread resolution on `main`; that is a separate control and Change.
- Installing is the Owner's, by hand, with the rest of CTL10. Nothing is loaded here.

## Old Cases the DO amends

release/T860 (in `04-controls/CTL10-approve-integration`) asserts `has` equals `['release/I36']` and that `CTL10.md` equals the C66 draft, and release/T862 asserts `integrating.json` equals the C66 draft. Both fail with the drafts (observed in `evidence.md`) and are amended in the DO to read the current draft (this Change's), never skipped, one at a time. release/T864 matches phrases that stay in the control text and keeps passing.

## Ids

Change `release/C81`, Intent `release/I46`, Requirement `release/F63`, Architecture `release/A58`, Gap `release/G104`, Cases T1042 to T1051 (six used). No new control: release/CTL10 gains an Intent. Reserved by the release thread on 18 Nov 2026.

## DO

Not authorized by this PLAN. On the merged PLAN, into the collector `kaal/release/thread-resolution`: add `I46.md`, `F63.md`, `A58.md`, amend `CTL10.md`, change the two settings, amend T860 and T862 to read the current target, rename T1042 to T1047 from `.red.mjs` to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md`.

## Left open

- The old promotion ruleset's thread resolution on `main` has no new owner.
- Whether CTL10's loading timing (after the sync bot's first live approval) changes: no, a bot SYNC carries no thread.
