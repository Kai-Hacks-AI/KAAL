# C132 do

What the DO built, against the decisions of `change.md`.

## Built

- `05-src/wiring/workflows/verify-triggers.yml` (the source of the installed `verify Triggers`): it checks out the default branch for the judge (`github.event.repository.default_branch`), fetches the base commit and the head as Git data into that repository, and runs the judge with `--fallback HEAD`. A judge absent on the default branch is UNKNOWN, exit 2 (decisions 1 and 5). Nothing of the pull request is checked out or run.
- `05-src/triggers/verify-triggers.mjs`: `judge` takes an optional `fallback`, the baseline file of the default branch as text. It is the accepted baseline **only when the base holds no baseline file**, a base that predates the control; the answer then says so (`fromDefault`, and a note on the report line). A base whose file is unreadable, not a list or not unique stays UNKNOWN. The head cannot widen it: a name its own file adds against the fallback is growth and fails. A head without its own file is UNKNOWN (decision 3). The command reads the fallback from `--fallback <ref>`.
- Cases T1430 (the judge function) and T1431 (the workflow's steps run as written on a pull request into a stale collector: a SYNC passes with the default branch's baseline and says so, a new use fails, a head that carries its own judge does not run it, a default branch without the judge is UNKNOWN). T1431 fails when `--fallback HEAD` is taken out of the source.

## Cases changed on purpose

T1124 holds the checkout to the default branch and the new absent-judge message. T1126 and T1134 name the renamed fetch step; T1134 no longer requires the source to equal the draft of release/C91 (the same supersession T1124 recorded for C91). Their targets and assertions are otherwise unchanged and green, as are C130's and C131's.

## Not done here

- `verify-workflow-names.yml` is engineering's source and is its own Change (engineering C35, #2417), which follows the same fallback rule for CTL36's baseline.
- No WIRE of `verify-triggers.yml` (the installed copy still runs the judge of the base until a WIRE, on Kai's go), no ruleset change, no flag.

## Recorded as a separate defect (CPO note on the PLAN)

A stale collector can hold an **outdated baseline file**: one that still lists a name which `main` has since removed from its allowance. The fallback does not apply there, because the file exists, so a pull request into that collector is judged against that older, wider allowance, and a SYNC that brings `main`'s smaller file is judged as a head that shrinks it (it passes). The wider allowance is therefore only reachable on the collector itself, never on `main`, and it is closed by the next SYNC. Closure is not required now (CPO). To be filed through the defect route with its own Case when it is picked up.
