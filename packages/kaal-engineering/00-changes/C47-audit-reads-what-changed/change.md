# C47 change

Asked by the coordinator (28 Nov) on the Owner's wish to refactor alongside the Apps: the Branching audit is a top spender of the shared workflow token, which was exhausted this morning. Read only what changed, using the push event's before and after, with a narrower read per event, without weakening the audit.

## What the audit reads today

| Event | Reads | Judges |
| --- | --- | --- |
| push, created (collector) | all activity, all pull requests | Establishment |
| push, deleted | all activity, all pull requests | nothing |
| push (landing) | all activity, all pull requests | Landing, and on `main` also Lifecycle (collectors, working branches) |
| schedule, dispatch | all activity, all pull requests | Establishment of every collector, Landing of the last two days, Lifecycle |

Each full read is one call per 100 records. With some 3000 pull requests and more activity records, one run is of the order of a hundred calls (an estimate until the DO's counter says; the DO adds the count, below).

## The design

| Event | Reads after | Judges after |
| --- | --- | --- |
| push, deleted | nothing: the script exits before any call | nothing |
| push, created (collector) | the activity of the default branch only (`activity?ref=refs/heads/<default>`), which is what `stateAt` needs | Establishment |
| push (landing) | the pull requests of the pushed commit (`commits/<after>/pulls`) and the activity of the pushed ref (`activity?ref=<ref>&activity_type=pr_merge`, newest first, one page) | Landing, and the unaccounted-merge check for this push only |
| schedule, dispatch | unchanged: everything, to the last page | unchanged: Establishment of every collector, Landing of the last two days, Lifecycle |

- **Lifecycle moves to the daily run and the dispatch.** It needs every pull request (a collector's open pulls and its promotions), so no narrow read can feed it. Its verdicts are reports of what is due ("the Owner deletes"), not a gate, so a day's delay costs nothing. A push to `main` stops running it. This is the one place the audit's latency changes, and it is named here for the CPO.
- **The unaccounted-merge check is the same check on a smaller set.** Today it compares all `pr_merge` activity ever with all pull requests. On a push it compares this push's `pr_merge` record with the pull requests of this commit. The daily run keeps the full comparison, so a merge that no pull request accounts for is still found, at the latest the next morning, and at the push when it is this push's.
- **Widen on doubt, never pass on doubt.** When the narrow read cannot answer (the commit's pull-request list is empty for a push the activity calls a merge, or either call fails), the audit says it cannot judge (exit 2) as it does today. It never passes on a thin read.
- **Measurement.** Every run prints `API calls: n`, counted from the calls the script makes, so the saving is read from the runs and not from this PLAN's estimate.

## Where it lives

The change is in `engineering/github/branching-audit.sh`, which the audit reads from the default branch's tip through kaal-guard (`.kaal/config/guard/Branching-audit.md`). The checker `lineage.ts` and its verdicts do not change: it already takes the pull requests of a landing as a file. So **no WIRE is needed**, no workflow file changes, and nothing under `.github` is touched.

## Design questions, with recommendations

1. **A narrower trigger.** Recommend none now. With the narrow read a push costs two or three calls, and a deletion none, so the trigger is no longer the spender. If the counter still shows the audit among the spenders, narrowing `on.push` is a workflow WIRE (its own Owner go) and its own Change.
2. **`commits/<sha>/pulls` for a squash or merge commit.** It lists the pull requests whose head or merge commit is the sha, which is what the audit's `landing` already selects (`.merge == after or .head == after`). The DO confirms it on the first live runs by the counter and the verdicts; the fallback is the full read, never a pass.
3. **Lifecycle daily.** Recommend daily plus dispatch, as above. The alternative, keeping it on `main` pushes, keeps the full read on every promotion.

## What this Change pins (Cases, plain `.test.mjs`)

The Cases run the script against a local repository with a recording stand-in for `gh`, so no network is used.

- T1757: a push that lands (to a collector and to the default branch) makes at most three GitHub calls, reads no list to its last page, reads no pull request list, and asks which pull requests its commit belongs to. RED.
- T1751: the deletion of a branch makes no GitHub call. RED.
- T1752: the daily run still reads every activity record and every pull request to the last page. GREEN guard.
- T1753: the creation of a collector reads the default branch's activity only and no pull request list. RED.
- T1754: every audit prints `API calls: n` and n is the number of calls made. RED.
- T1755: a merge into the default branch that no merged pull request accounts for still fails the audit. GREEN guard.
- T1756: a merge that a merged pull request accounts for is not reported as unaccounted. GREEN guard.

## Not in this Change

A workflow change, a WIRE, a ruleset change, a change to `lineage.ts` or its verdicts, and any other spender of the token (merge-group poll, CodeQL gate poll, Change Isolation). Those have their own Changes.

## Amendment: the numbers and one assertion

Two corrections, in this PR before the DO is reviewed, and nothing else:

- **The id of the first Case.** release/T1750 (hotfix C200) is already on a collector, so the Case that was T1750 is **T1757**, after a scan of every remote branch (T1757 is free). The text above says T1757 where it said T1750.
- **T1753, its last assertion.** It looked for `per_page=100` with no `ref=` after it, so it held only when `per_page` came before `ref` in the URL: it meant "no activity read without a ref" and could fail a correct read. It now says that: no activity URL without `ref=`. The other two assertions are unchanged. Expectation unchanged: the creation of a collector reads the default branch's activity only.
