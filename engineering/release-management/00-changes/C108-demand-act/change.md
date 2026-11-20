# C108 change

## PLAN

1. Add the drafts in `interface.md`: Intent I58, Requirement F84, Architecture A74, control CTL29 `demand Act` (detective first) and the judge `05-src/phase/judge-demand-act.mjs` with its command line.
2. Add the Cases T1294 to T1298, all RED: I58 (T1294), F84 (T1295) and CTL29 (T1298) equal their drafts, the control accepted by the controls checker with its minimum evidence; A74 and the pure judge (T1296): PASS when every carried Change has its ACT, is not finished, or none is carried; FAIL naming each Change that is finished and has no ACT; UNKNOWN, never PASS, when it cannot be told, and FAIL outranks UNKNOWN; the command line over a tree (T1297): parked Cases owe nothing, a finished Change without its ACT exits 1 and is named, its ACT makes it 0, a Change that is not there or an unobserved Case exits 2, and a commit titled ACT closes nothing.
3. Observe the expected RED and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN changes no judge, no declaration, no workflow, no ruleset source, no hook and nothing under `.github`.

## Ids

Change `release/C108`, Intent `release/I58`, Requirement `release/F84`, Architecture `release/A74`, control `release/CTL29`, Cases T1294 to T1298. No gap id.

## What it demands, and what it leaves to others

- **Demands**: for each carried Change with no ACT beside its folder, if the work is finished (every applicable Case not parked and observed GREEN, decided by `judgeAct` of release/C103), the Change is due: `Change closed, ACT due: <Change>`.
- **Leaves to others**: a Change that still has red Cases owes no ACT yet, and whether a promotion may carry it is another small control; what an ACT must contain is `verify Act`; that an ACT may not stand while Cases are red is `hold Act`.
- **Which Changes a promotion carries** is derived from content by kaal-change (the carries, by Change ID, never from the title or the body of the pull request); the wiring hands the list in. The judge is given it and derives nothing.
- **Why not on the collector.** At `23 - collecting` the check would fail the DO that closes the last red Case, because at that moment everything is green and the ACT has not yet been written. At `30 - promoting` the ACT must already be there.

## Boundary: the unfinished Change (CPO question, 20 Nov 2026)

`demand Act` says PASS for a carried Change that is unfinished, red or parked Cases and no ACT, on purpose: it asks for the ACT only once the work is finished. **The gap is open and C108 does not cover it.** No existing control refuses the promotion of an unfinished Change today: `hold Act` (release/C103) only keeps an ACT out of a collector while Cases are red, and an unfinished Change has no ACT. The control that does is planned as its own small Change (provisionally release/C109, "no unfinished Change is promoted", name to be settled by the Owner): at the Promoting station it would say FAIL, naming them, for each carried Change whose applicable Cases are not really green, using the same judge (`judgeAct` of release/C103) so that the three controls cannot disagree about when work is finished, and it would follow the same detective-first rollout. It is not part of C108 and nothing of it is built here.

## DO

On the merged PLAN, after the DO of release/C103 is on the collector, into the collector of this Change:

1. Add the five files of `interface.md`: `01-intent/I58-change-closed-by-act/I58.md`, `02-requirements/F84-demand-act/F84.md`, `03-architecture/A74-judge-demand-act/A74.md`, `04-controls/CTL29-demand-act/CTL29.md` and `05-src/phase/judge-demand-act.mjs`.
2. After release/C105's DO is on `main`, add `parent: release/A68` to A74.
3. Rename T1294 to T1298 from `.red.mjs` to `.test.mjs` when green.

## Accept list

None. No existing Case reads what this Change adds. The runner on the throwaway copy (the drafts of release/C103's judge and of this Change placed): 305 tests, 289 pass, the 16 failures of the collector unchanged.

## Places that ask the judgement

The judge is one function; the places decide what a verdict does. The required check of the Promoting station (a job `demand Act` on the promotion, a WIRE, and the declaration on the station, after the DOs of release/C105 and C106 shape the same files) blocks and UNKNOWN does not pass. The advisory hook, a part of the pre-push dispatcher, runs the same judge on the branch being pushed and nudges `Change closed, ACT due` once a push has made everything really green; it never blocks and a verdict it cannot reach is a note. Both are later Changes.

## Left open

- The job, the station declaration and the hook, as above.
- The carried Changes: the hand-over from kaal-change's carries.
- The observed run: the adapter from Testing's report (as for `hold Act`).
- Evidence: `real:2` is a promotion that passes and one that is refused for a missing ACT; `provoked:1:fail` is a scratch collector with a finished Change and no ACT, which the Owner creates.

## ACT

A 4L retrospective in the ACT before the promotion.

## Rollout of `demand Act`, detective first

As for `hold Act` (release/C103, on the CPO's review of it, 20 Nov 2026): the control is declared `detective` and `designed` now and becomes preventive only in the Change that makes the check required.

1. **Observe.** The verdict is observed on real promotions by running the command line on them, nothing blocked. The observation of Testing is a precondition (its adapter is a later slice); until then the observed runs are hand-made and say so.
2. **Advisory check.** A job `demand Act` on the promotion behind a feature flag (a repository variable, off by default; `advisory` reports and never fails the pull request). Evidence: `real:1` is a real promotion, `provoked:1:fail` a scratch collector with a finished Change and no ACT. A WIRE with the Owner's go; not part of this Change.
3. **Required.** Only after validation and the Owner's explicit authorization is the check declared on the `30 - promoting` station and loaded by the Owner; then the control is preventive (two real runs), and release/CTL26 observes it in force.

The judge never blocks; the place that asks decides; once required, UNKNOWN does not pass.
