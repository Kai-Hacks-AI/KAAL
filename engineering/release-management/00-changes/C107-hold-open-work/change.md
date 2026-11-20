# C107 change

## PLAN

1. Add the drafts in `interface.md`: Intent I57, Requirement F83, Architecture A73, control CTL27 and the judge `05-src/open-work/judge-open-work.mjs` with its command line.
2. Add the Cases T1285 to T1291, all RED: I57 (T1285), F83 (T1286) and the control CTL27 (T1291) equal their drafts, and the control is accepted by the controls checker with its minimum evidence; A73 and the judge equal their drafts and PASS when nothing other than the promotion is based on the branch (T1287); FAIL names every pull request based on it (T1288); UNKNOWN, never PASS, for an unreadable branch, promotion, list or item, for an incomplete list, and for a promotion of `main` (T1289); the command line exits 0, 1 and 2 (T1290).
3. Observe the expected RED and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN changes no judge, no declaration, no workflow, no ruleset source and nothing under `.github`.

## Ids

Change `release/C107`, Intent `release/I57`, Requirement `release/F83`, Architecture `release/A73`, control `release/CTL27`, Cases T1285 to T1291. No gap id.

## DO

On the merged PLAN, into the collector of this Change:

1. Add the five files of `interface.md`: `01-intent/I57-no-open-work-behind/I57.md`, `02-requirements/F83-hold-open-work/F83.md`, `03-architecture/A73-judge-open-work/A73.md`, `04-controls/CTL27-hold-open-work/CTL27.md` and `05-src/open-work/judge-open-work.mjs`.
2. After release/C105's DO is on `main`, add `parent: release/A68` to A73.
3. Rename T1285 to T1291 from `.red.mjs` to `.test.mjs` when green.

## Accept list

None. No existing Case reads what this Change adds. The runner on the throwaway copy: 321 tests, 305 pass, the 16 failures of main unchanged.

## Why preventive, and why the Promoting station

The judgement is about the promotion pull request, which exists only in front of `main`. The `20 - integrating` rulesets apply to pull requests into `kaal/**`, `hotfix/**` and `wire/**` and never see a promotion, so only `30 - promoting` can stop it. The concern belongs to the Integrating flow, which owns the collectors and their lifecycle, and the control is realized at Promoting. Engineering's view was to start as detective: this Change starts as the detection alone, which anyone can run, and the control declares itself preventive for what it is for. A station requiring the check is a separate step the Owner takes by loading the declaration; release/CTL26 then observes that it is in force.

## Left open (next slices, not done here)

- **Facts**: gathering the open pull requests of the repository through Hosting (hosting/C111 `readPullRequests`) into the facts file, with `complete` true only when the list is whole; a cut list is UNKNOWN.
- **The job**: a workflow `verify Open work` that runs the judge on the promotion, a WIRE with the Owner's go.
- **The station**: `stages.json` declares the check on Promoting, traced to release/CTL27, and release/C106 and C105 shape the same files first, so this follows both DOs.
- **Evidence**: `real:2` is a run on a real promotion that passes and one that fails; `provoked:1:fail` is a scratch collector with a pull request based on it, which the Owner creates.
- **Not claimed**: a pull request opened after the judgement and before the merge; branches that descend from the collector without a pull request; the deletion of the branch, which is the Owner's step.

## ACT

A 4L retrospective in `act.md` before the promotion.
