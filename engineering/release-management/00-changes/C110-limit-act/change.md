# C110 change

## PLAN

1. Add the drafts in `interface.md`: Intent I59, Requirement F85, Architecture A75, control CTL30 `limit Act` (detective first), the judge `05-src/phase/judge-limit-act.mjs` with its command line and the data `05-src/phase/write-map.json`.
2. Add the Cases T1300 to T1304, all RED: I59 (T1300), F85 (T1301) and CTL30 (T1304) equal their drafts, the control accepted by the controls checker with its minimum evidence; A75, the data and the pure judge (T1302); the command line over files (T1303).
3. Observe the expected RED and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN changes no judge, no data, no declaration, no workflow, no ruleset source, no hook and nothing under `.github`.

## Ids

Change `release/C110`, Intent `release/I59`, Requirement `release/F85`, Architecture `release/A75`, control `release/CTL30`, Cases T1300 to T1304. No gap id.

## What it limits, and what it leaves to others

- **Limits**: a pull request that changes anything in a folder that the route `act` writes is an ACT. Everything it changes must lie in those folders; each path outside is named in the verdict. A pull request that touches none of them is not an ACT and passes untouched.
- **The write map, and its owner.** Release owns the write map (`05-src/phase/write-map.json`): who may write which folder in the PDCA, a row per route, each folder a prefix in which `*` stands for exactly one path segment (the capability). The owner of a row's object owns the folders it names (the retros: kaal-retro, by Exchange). **This Change adds one row**, the route `act`: the retro folders `engineering/*/02-learnings/retros/` and `packages/*/02-learnings/retros/` (the CPO's review: the retro of kaal-retro is `packages/kaal-retro/02-learnings/retros/RT1.md`), and the legacy places of an ACT as exact files, `engineering/*/00-changes/*/act.md`, `packages/*/00-changes/*/act.md` and `packages/*/plan/*/act.md`. The judge reads only that row. The target (Owner, 20 Nov 2026): a hotfix may write everything, so it is a different route with its own control; a wire may write only the delivery folders, again its own route and control. Those rows are later Changes, each added together with the control that uses it, so that no row exists without a judge.
- **Folders are the lock.** Part of why the layout is folders is that they are easy to lock (Owner): the same map is what a ruleset path restriction would later lock. This Change only judges.
- **The paths** an ACT pull request changes are handed in by the wiring as facts (every path added, modified, deleted, and both ends of a rename). The judge reads nothing of Git or GitHub, of a title, a branch name or a label.
- **Leaves to others**: whether the collector is ready (release/C103); whether the ACT is present before promotion (release/C108); the format of the retro (`verify Act`); and whether a pull request was entitled to change Cases or artifacts at all (transport authorization, change/F56).
- **Where it runs.** On pull requests into a collector, at `23 - collecting`, the station where `hold Act` runs. The place that asks decides what a verdict does.

## The real layout, and legacy ACTs (CPO review)

KAAL has two trees of capabilities, `engineering/<capability>/` and `packages/<package>/`, and ACTs exist in three places today: the retros (the new place, in either tree), the file `act.md` of a Change folder (the many of release-management and others, `packages/kaal-engineering/00-changes/C27-operations-layout/act.md` among them) and the file `act.md` of a plan folder (`packages/kaal-testing/plan/*/act.md`). The row holds all three, so a valid ACT is recognised wherever it is written. Legacy places are **files, not folders**: a folder entry for a Change folder would let a pull request that changes an `act.md` also rewrite the Cases or the source in the same Change folder, which is the evasion the control exists to stop. Nothing is migrated: only pull requests are judged, so the ACTs already merged are never re-read. When no ACT is written in a legacy place any more, its entry is deleted from the data, without a change of the judge. The templates named `act.md` (`.github/PULL_REQUEST_TEMPLATE/act.md`, `05-src/wiring/templates/act.md`) are not ACTs and match no entry. A pull request that is not an ACT is not judged here: what it may write is the row of its own route, in later Changes.

## ACT

A 4L retrospective in the ACT before the promotion.

## Rollout of `limit Act`, detective first

As for `hold Act` (release/C103): the control is declared `detective` and `designed` now and becomes preventive only in the Change that makes the check required.

1. **Observe.** The verdict is observed on real ACT pull requests by running the command line on their changed paths, nothing blocked.
2. **Advisory check.** A workflow `limit Act` on pull requests into a collector behind a feature flag (a repository variable, off by default; `advisory` reports and never fails the pull request). Evidence: `real:1` is a real ACT pull request, `provoked:1:fail` a scratch pull request that adds a retro and edits a Requirement. A WIRE with the Owner's go; not part of this Change.
3. **Required.** Only after validation and the Owner's explicit authorization is the check declared on the `23 - collecting` station and loaded by the Owner; then the control is preventive, and release/CTL26 observes it in force.

The judge never blocks; the place that asks decides; once required, UNKNOWN does not pass.

## Left open

- The wiring that hands in the changed paths, the workflow, the hook mirror and the station declaration.
- Where the retros live: `02-learnings/retros` needs C27 (the 0 group, with `00-changes` becoming `01-changes`) and kaal-retro; the data holds the pattern meanwhile.
- The name: `limit Act` is the CPO's provisional name, confirmed by the Owner's concept (limit the ACT to ACT activities).
- The other rows of the write map and their controls, each its own Change: the hotfix route (writes everything), the wire route (only the delivery folders), and the PDCA rows PLAN (writes the Cases of the plan folders) and DO (writes source and the unit tests inside source, not the Cases of the plan; Owner, 20 Nov 2026). The last needs settling when its row is planned: today a DO closes the Cases of its PLAN by renaming `.red.mjs` to `.test.mjs` in the plan folder, as the DO of this Change does.

## DO

On the merged PLAN, into the collector of this Change: add the six files of `interface.md` (`01-intent/I59-act-does-only-act-work/I59.md`, `02-requirements/F85-limit-act/F85.md`, `03-architecture/A75-judge-limit-act/A75.md`, `04-controls/CTL30-limit-act/CTL30.md`, `05-src/phase/judge-limit-act.mjs`, `05-src/phase/write-map.json`) and rename the Cases from `.red.mjs` to `.test.mjs`.
