# Process PLAN: pilot "PR first, work second" on the Review collector

Draft. Status: PLAN only. Nothing runs until Kai picks the pilot capability. Provisional number 03/03.

## Intent

Test, on one low-risk collector, that opening the PR first (holding the PLAN) and working second gives a live roadmap that wakes the owning thread. The aim is evidence, not a rule: no process changes, no new gate, no new package. Source: Kai's ask of 3 Nov and the analysis document "PR first, work second: analysis and staged pilot".

## Why Review

Review is a meta-level capability off the release path (Hosting, Foundation, Core, Guard), so the scarcity rule is not at stake. Its collector is quiet. If Kai picks Roles or another collector, only the names below change.

## Stages and exit criteria

| Stage | What | Exit criterion |
|---|---|---|
| 0 | Baseline: how Review Changes start and how long a Change sits unseen | Recorded on this PR before Stage 1 |
| 1 | Change level: each Review Change opens a draft PR into `kaal/review` first, holding its PLAN, on auto-merge | Three consecutive Changes opened PR-first, no orphan, no draft stale beyond the agreed age, owner thread woke on each CI and review event |
| 2 | Collector level: a standing draft `kaal/review` → `main`, opened at work start, listing its Changes, stating it is not a promotion request | Draft readable through one SYNC and one promotion decision; freshness-red noise caused no wrong action |
| 3 | Parent link: a `Parent: #n` line, base branch where one exists; a check reports a mismatch as a finding only | Catches a deliberately orphaned test child, no false positive across Stages 1 and 2 |
| 4 | Milestone level: one roadmap PR for a small milestone, not the release sequence | Readable as a roadmap; merged or closed cleanly with its children; Kai decides whether it merges or is closed as a tracker |

Stages run one at a time. Widening past Stage 2 needs the earlier exit criteria met and Kai's pick.

## What is measured

- Draft age, and drafts older than the agreed age without child activity.
- Wakes: child open, merge, red, per level.
- Order slips: Changes where work started before the PR.
- CI noise on standing drafts and whether it caused a wrong action.

## Out of scope

Hosting, Foundation, Core and Guard. Changes to Branching, Change Isolation or any workflow (`.github` travels alone). Any SYNC, promotion or publication.

## Open points for Kai

1. Which capability to pilot (Review recommended).
2. Whether a milestone PR merges or is closed as a tracker.
3. The agreed stale age for a draft.

## Scope

This record only. Markdown. No Node, Definition, claim, package, workflow or policy changes.
