# C111 change

## PLAN

1. Add the drafts in `interface.md`: Intent I60, Requirement F86, Architecture A76, control CTL31 `verify Act` (detective first) and the judge `05-src/phase/judge-verify-act.mjs` with its command line.
2. Add the Cases T1305 to T1309, all RED: I60 (T1305), F86 (T1306) and CTL31 (T1309) equal their drafts, the control accepted by the controls checker with its minimum evidence; A76 and the pure judge (T1307): FAIL naming each retro of a carried Change that is malformed, with the rules once each, and each file the finder refuses; UNKNOWN, never PASS, for a form that is unjudged, missing or unknown; PASS when each retro of the carried Changes is well formed, when no retro reflects a carried Change, and for a retro of another collector whatever its form; FAIL outranks UNKNOWN; the command line over a tree with the real kaal-retro scripts (T1308): a well-formed retro passes, a missing `Account of:` line or sections out of order are named by kaal-retro's own rules, a format it does not know exits 2, a file the finder refuses exits 1, scripts not given or not there and a Change that is not there exit 2, and a commit titled ACT changes nothing.
3. Observe the expected RED and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN changes no judge, no declaration, no workflow, no ruleset source, no hook and nothing under `.github`, and nothing of kaal-retro.

## Ids

Change `release/C111`, Intent `release/I60`, Requirement `release/F86`, Architecture `release/A76`, control `release/CTL31`, Cases T1305 to T1309. No gap id.

## What it checks, and what it leaves to others

- **Checks**: a retro that reflects a carried Change is well formed, as kaal-retro judges it. A file that looks like a retro and that kaal-retro's finder refuses is revealed too, whatever it reflects: it would otherwise be invisible to `hold Act` and `demand Act`, which only count what is found. FAIL names the retro and the rules (`retro form: <path> is not well formed (<rules>)`).
- **Exchange, answered**: release does not define the form and does not copy the finder. The command line is handed the scripts directory of the kaal-retro Skill (`--retro`), never finds it by a fixed path, and a missing script is UNKNOWN. The judge itself is pure over the answers.
- **Leaves to others**: whether a retro is true or its fix right is nobody's here, and the Owner decides; how many retros reflect a Change and whether every carried Change has one is `demand Act` (release/C108); that a retro may not stand while Cases are red is `hold Act` (release/C103); that an ACT writes only ACT folders is `limit Act` (release/C110). A retro of an earlier collector was verified when that collector closed and is not judged again; a refused file stays refused wherever it lies in the retros folder, which is the conformance defect it is.
- **Where it sits.** At the collector with the ACT (it cannot deadlock the DO: it says PASS while no retro reflects a carried Change) and again at the promotion; which, and whether both, is the next Change that wires it. This Change places it nowhere.

## DO

On the merged PLAN, after the DO of release/C103 is on the collector, into the collector of this Change:

1. Add the five files of `interface.md`: `01-intent/I60-act-is-a-well-formed-retro/I60.md`, `02-requirements/F86-verify-act/F86.md`, `03-architecture/A76-judge-verify-act/A76.md`, `04-controls/CTL31-verify-act/CTL31.md` and `05-src/phase/judge-verify-act.mjs`.
2. After release/C105's DO is on `main`, add `parent: release/A68` to A76.
3. Rename T1305 to T1309 from `.red.mjs` to `.test.mjs` when green.

## Accept list

None. No existing Case reads what this Change adds.

## Places that ask the judgement

The judge is one function; the places decide what a verdict does. The required check at a station (a job `verify Act`, a WIRE, the declaration on the station, which the Owner loads) blocks and UNKNOWN does not pass. The advisory hook, a part of the pre-push dispatcher, runs the same judge on the branch being pushed and nudges a malformed retro before the push; it never blocks and a verdict it cannot reach is a note. Both are later Changes.

## Left open

- The job, the station declaration and the hook, as above; which station asks it.
- The hand-over of the carried Changes from kaal-change's carries, and the place where the scripts of kaal-retro are found by the wiring.
- Evidence: `real:1` is a real retro judged on a real collector; `provoked:1:fail` is a scratch collector with a malformed retro, which the Owner creates.

## ACT

A 4L retrospective in the ACT before the promotion, written by the thread that did the work.

## Rollout of `verify Act`, detective first

As for `hold Act` (release/C103) and `demand Act` (release/C108): the control is declared `detective` and `designed` now and becomes preventive only in the Change that makes the check required.

1. **Observe.** The verdict is observed on real retros by running the command line on them, nothing blocked.
2. **Advisory check.** A job `verify Act` behind a feature flag (a repository variable, off by default; `advisory` reports and never fails the pull request). Evidence: `real:1` and `provoked:1:fail`. A WIRE with the Owner's go; not part of this Change.
3. **Required.** Only after validation and the Owner's explicit authorization is the check declared on its station and loaded by the Owner; then the control is preventive (two real runs), and release/CTL26 observes it in force.

The judge never blocks; the place that asks decides; once required, UNKNOWN does not pass.

## Challenge to the legacy controls

`verify Act` retires nothing today: no legacy control judges the form of an ACT. The 83 older `act.md` files in Change folders are not read by it; their migration to retros is a separate matter.
