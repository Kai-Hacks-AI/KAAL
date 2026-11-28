# Solution protection: Intent

This is `guard/C171`, a PLAN Change. It ships no code. A DO turns its planned Cases GREEN. The Change id and the Case ids T1670 to T1677 are provisional, taken by hand; on a clash the newer Change renumbers (Core's `nextID` is not yet in use).

## Why now

Eight package suites (controls, architecture, backlog, defect, engineering, guard, research, retro) run in no required check. They sit outside the root workspaces and run only in advisory jobs, so a combined red (T1574) reached main. Controls has a stopgap (release C165 adds it to the root workspaces). The other seven wait for Guard to register every suite. This Change makes that possible: Guard becomes the place where the solution is protected.

## Intended outcomes

- **guard/I10 No suite outside a required lane.** Every suite of the solution is registered with Guard as a check, runs on `pull_request` and `merge_group` under one required name, and is folded into it. A suite that is not registered is found as missing, and a registered one that did not run fails loud. Nothing relies on someone remembering to wire a new suite.
- **guard/I11 A check cannot opt itself out.** A pull request can add registrations for its own packages, so a Change is hard-checked during itself. It cannot remove, narrow or reword a registration the base already holds.
- **guard/I12 Loud and guiding.** Every failure says what failed, where (check, aggregate, file), why and what to do, in a report an agent reads (`guard-report.json`), the same locally and in CI.

## Boundaries

- Guard stays dumb: it runs a command and reads an exit status. It learns no mode, flag, STAMP or evidence, and imports nothing of Controls or Testing. The mode of a control comes only from the control's own flag.
- Only the `solution` aggregate is built here. `change` and `delivery` are reserved names and are refused until their own Changes.
- Legacy checks (the `.md` declarations) are never members of an aggregate and never enter a new ruleset.
- No WIRE, no ruleset edit, no suite registration in other packages, no npm publish. Each of those is a separate go of the Owner.
