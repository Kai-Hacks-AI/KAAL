# Process PLAN: pilot "PR first, work second" on the Review collector

Status: PLAN. Kai agreed the pilot on Review (3 Nov), starting at the outermost level, the package. The standing package PR into `main` waits for Kai's answer on the auto-merge hold. Provisional number 03/03.

## Intent

Test, on one low-risk collector, that opening the PR first (holding the PLAN) and working second gives a live roadmap that wakes the owning thread. The aim is evidence, not a rule: no process changes, no new gate, no new package. Source: Kai's ask of 3 Nov and the analysis document "PR first, work second: analysis and staged pilot".

## Why Review

Review is a meta-level capability off the release path (Hosting, Foundation, Core, Guard), so the scarcity rule is not at stake. Its collector is quiet. If Kai picks Roles or another collector, only the names below change.

## Level model (Kai, 3 Nov)

Each level is an expectation, stated in a PR and answered by the level inside it:

1. **Package expectation** (a PR: what the package is to deliver) is answered by
2. **main expectations** (what must be on `main` to deliver it), which are answered by
3. **`kaal/*` expectations** (the collector work that provides it).

The ratio is 1:n:m: one package expectation has n main expectations, each with m `kaal/*` expectations. The strength is that **any level can raise against the level above it**: a child that finds the parent's expectation unclear, wrong or impossible raises it on the parent PR (a comment or finding there), rather than working around it. Raising wakes the parent's thread, because PR comments are PR events. A parent's answer is the next version of its expectation, so the roadmap corrects itself from the inside out.

In the pilot this means: the package PR states the expectation, the capability and Change PRs name it as their `Parent:` and answer it, and a child that cannot answer it raises on the parent. A raise is a finding, never a gate.

## Stages and exit criteria

| Stage | What | Exit criterion |
|---|---|---|
| 0 | Baseline: how Review Changes start and how long a Change sits unseen | Recorded on this PR before Stage 1 |
| 1 | **Package level (outermost, Kai 3 Nov):** one standing PR for the `kaal-review` package, `kaal/review` → `main`, opened ready at work start, listing the capability work under it, stating it is not a promotion request | PR readable through one SYNC and one promotion decision; freshness-red noise caused no wrong action; no failure criterion hit. Opening it needs Kai's answer on the auto-merge hold first |
| 2 | **Capability level:** the Review capability's own plan PR into `kaal/review`, declaring the package PR as its parent | Declared parent matches the PR graph; owner thread woke on each child open, merge and red; at least one child raised against its parent and the parent's thread woke on it |
| 3 | **Change level and below:** each Review Change opens a ready PR into `kaal/review` first, holding its PLAN, on auto-merge, declaring its parent | Three consecutive Changes opened PR-first, no orphan, no PR stale beyond the agreed age |
| 4 | Parent link: a `Parent: #n` line, base branch where one exists; a check reports a mismatch as a finding only | Catches a deliberately orphaned test child, no false positive across Stages 1 to 3 |

Levels (Kai): 1 package, 2 capability, 3 and so on inward. The pilot starts at the outermost level and works inward, one level at a time. A milestone level above the package is out of scope for this pilot.

## No drafts: standing PRs are ready, on auto-merge, and gated (Kai, 3 Nov)

GitHub refuses auto-merge on a draft, and Branching requires it, so a draft would always be red. Every PR at every level is therefore opened ready, with squash auto-merge on, as the MERGE RULE already says. The PR cannot merge too early because a gate holds it, never because it is a draft:

- **Withheld approval.** The CPO's approval, withheld until the children are done, is the gate. Auto-merge fires only on approval plus green checks.
- **Unmet checklist.** The PR body carries a children checklist (each child with its `Parent:` line). The reviewer withholds approval while an item is open; the owner thread ticks items as children merge.
- **Promotions into main** (package or collector) are Owner-reserved: they need Kai, and the thread asks on the PR, which stays on auto-merge, as the MERGE RULE says. A standing package PR states in its body that it is not a promotion request.
- **Not a gate:** a failing required check. A standing PR that is red for freshness is fixed at its promotion turn, not by closing it.

Withheld approval is **not the only safeguard** for a standing PR into `main` (CPO review of 3 Nov). Hold and cancellation, defined before any pilot starts:

- **Hold (reversible, at any time).** The owner thread disables auto-merge on the standing PR. Disabling is the safe default whenever the PR is not in its promotion turn, and a standing package PR is held this way from the start of Stage 1: it is opened ready, with auto-merge **off** until Kai authorizes that promotion, then enabled. This keeps the ready-PR rule (no drafts) for change-level PRs, where an early merge is harmless, and applies the stricter hold only to PRs targeting `main`, where an early merge is a promotion. **This departs from Kai's MERGE RULE (always on auto-merge, promotions included), so it is proposed for the pilot only and needs Kai's decision before Stage 1 opens the package PR.**
- **Cancel.** Closing the PR cancels the intent without merging. It is always available to the owner thread, the CPO and Kai.
- **Accidental approval or merge.** An approval cannot merge a held PR (auto-merge is off). If one ever merges early, or an approval lands while a hold should apply, the pilot **stops** at once and the event is recorded as a failure.

Failure criteria, any one of which stops the pilot and returns to Kai:

1. A standing PR into `main` merges, or becomes mergeable with auto-merge on, without Kai's authorization.
2. A promotion jumps the release queue (Hosting, Foundation, Core, Guard) or is read as a request to.
3. An approval is given on a standing PR that was not meant to carry one.
4. A stale standing PR is mistaken for live intent and acted on.
5. The pilot's own PRs add noticeable load to the release queue's reviews or CI.

Stages run one at a time. Moving inward past Stage 1 needs the earlier exit criteria met, no failure criterion hit, and Kai's pick.

## What is measured

- Open PR age, and standing PRs older than the agreed age without child activity.
- Wakes: child open, merge, red, per level.
- Order slips: Changes where work started before the PR.
- CI noise on standing PRs and whether it caused a wrong action.
- Accidental approval or merge events (target zero), time to hold or cancel when asked, and extra review and CI load on the release queue.

## Out of scope

Hosting, Foundation, Core and Guard. Changes to Branching, Change Isolation or any workflow (`.github` travels alone). Any SYNC, promotion or publication.

## Open points for Kai

1. Which capability to pilot (Review recommended).
2. Whether the standing package PR opens with auto-merge off (the hold above).
3. The agreed stale age for a standing PR.

## Scope

This record only. Markdown. No Node, Definition, claim, package, workflow or policy changes.
