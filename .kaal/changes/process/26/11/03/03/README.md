# Process PLAN: pilot "PR first, work second" on the Review collector

Status: PLAN. Kai agreed the pilot on Review (3 Nov), starting at the outermost level, the package, with auto-merge on for every PR. The standing package PR is opened once this PLAN is approved. Review notes that `kaal/review` still uses the old package layout, so it needs a SYNC first (Review's own call under the SYNC policy). Provisional number 03/03.

## Framing: backwards thinking, not forward coding (Kai)

Start from the expected outcome and work back. The package PR states what the package is to deliver and its **RED Test Cases**. The `main` and `kaal/*` expectations beneath it are derived from those, and the Changes are the work that turns them GREEN. We do not code forward and hope it adds up: if the Changes do not add up to the package's red Test Cases going green, the gap shows on the package PR before the work is finished.

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

## Every PR runs the full PDCA, red to green (Kai, 3 Nov)

Every PR at every level does the full cycle, not a part of it: PLAN (the expectation, stated in the PR before the work), DO (the work that answers it), CHECK (Test Cases), ACT (what was learned feeds the next PLAN; persistence is Learning's, not a mandated record). The expectation is made checkable the same way at each level. Intent, Requirements, Architecture and Defects are all answered by Test Cases, so a PR goes **cleanly from red to green**: the expectation is first written as a RED Test Case, and the PR's work turns it GREEN. A PR whose expectation cannot be stated as a Test Case is a finding on its parent (raised, per the level model), not a PR to start. This is how the existing rule (Intent and Requirements become RED Test Cases, then RED to GREEN) is applied at the package and capability levels as well as the Change level.

Pilot measure: the share of pilot PRs whose expectation was a RED Test Case before the work began, and PRs that reached green without the expectation changing.

## Extra attention and review rounds (Kai, 3 Nov)

This is an experiment, so it gets more review than ordinary work, not less. At each level (package, main, `kaal/*`):

1. **Checkpoint before the level starts.** The CPO reviews the level's expectation (its PR text and its RED Test Cases) before any work answers it.
2. **Checkpoint before the level advances.** A CPO round on the level's evidence (the exit criterion, the findings log, the failure criteria) precedes moving one level inward. No level advances on the owner thread's say-so.
3. **Review thread in the loop.** The Review thread observes each checkpoint and adds its findings; Review keeps driving its own work.
4. **Findings log.** One running log on the package PR, kept by Process: each finding with its level, who raised it, what it affects and its disposition (fixed, deferred to a Defect with a RED Test Case, or invalid with reasons). Raises against a parent level (see the level model) are entered there too. Nothing is dropped silently.

These rounds are review, not a new gate: a finding never blocks by itself, and approval stays the CPO's.

## Stages and exit criteria

| Stage | What | Exit criterion |
|---|---|---|
| 0 | Baseline: how Review Changes start and how long a Change sits unseen | Recorded on this PR before Stage 1 |
| 1 | **Package level (outermost, Kai 3 Nov):** one standing PR for the `kaal-review` package, `kaal/review` → `main`, opened ready at work start, listing the capability work under it, stating it is not a promotion request | PR readable through one SYNC and one promotion decision; freshness-red noise caused no wrong action; no failure criterion hit. Opens after this PLAN is approved |
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

**Auto-merge is on for every PR, the standing package PR into `main` included, with no hold (Kai, 3 Nov: "it's supposed to be on, on all PRs").** The CPO's safety concern (3 Nov review) is met without turning auto-merge off:

- **The promotion gate is required review.** A promotion into `main` needs Kai's go plus the CPO's formal approval **at the head SHA**, enforced through required review. A new push dismisses the approval, so a standing PR cannot merge on a stale approval. Auto-merge only fires once that approval exists on the current head.
- **Cancel.** Closing the PR cancels the intent without merging. It is always available to the owner thread, the CPO and Kai.
- **Accidental approval or merge.** An approval not meant to carry a promotion is a failure of the pilot (below), recorded and returned to Kai.

Failure criteria, any one of which stops the pilot and returns to Kai:

1. A standing PR into `main` merges without Kai's go and the CPO's approval at its head SHA.
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
- Accidental approval or merge events (target zero), time to cancel when asked, and extra review and CI load on the release queue.

## Out of scope

Hosting, Foundation, Core and Guard. Changes to Branching, Change Isolation or any workflow (`.github` travels alone). Any promotion or publication. The SYNC Review needs for the new layout is Review's own Change under the standing SYNC policy, not part of this PLAN.

## Open points for Kai

1. Which capability to pilot (Review recommended).
2. (Decided: auto-merge on for all PRs, no hold.)
3. The agreed stale age for a standing PR.

## Scope

This record only. Markdown. No Node, Definition, claim, package, workflow or policy changes.
