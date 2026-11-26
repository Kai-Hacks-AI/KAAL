# C36 change

Asked by release through the coordinator (26 Nov), who say the CPO and the Owner placed the contract with Engineering. This is Engineering's answer: the lists reviewed, the contract as one data file, and the two open questions answered. The recommended answers are decisions for the CPO; the DO follows what is approved.

## The answer in six lines

1. **One data file.** `skills/kaal-engineering/references/write-areas.json`, beside `package-layout.json`. Rows are `{ path, phase }`, paths relative to a capability root in the newest layout. A path belongs to the phase of the longest row it lies under; a row matches whole segments, and `*` inside a segment stands for any characters of that segment. A path no row names belongs to no phase and is reported, never guessed. Release's `write-map.json` reads this file and keeps no phase rows of its own.
2. **The three areas are exclusive and exhaustive over the layout.** PLAN: `00-backlog`, `01-changes` (except `do.md` and `act.md`), `02-learnings/research`, `02-learnings/rehearsals`, `02-learnings/reviews`, `10-intent`, `11-requirements`, `12-architecture` and `15-defects` with their Cases and review items, and `14-operations/controls` (the control records) and `14-operations/review-items`. DO: `13-source` (source, scripts, workflows and the unit tests inside it), `01-changes/*/do.md`, `14-operations/controls/*/baseline.json`, and the package root files `AGENTS.md`, `README.md`, `LICENSE`, `package.json`, `*.kaal.json`. ACT: `02-learnings/retros` and `01-changes/*/act.md`.
3. **A review item follows its parent folder's phase.** `review-items` in `10`, `11`, `12`, `15` is PLAN, in `13-source` DO, in `14-operations` PLAN.
4. **Legacy names are a short alias list in the same file**, marked legacy and removed with the migration of the last capability that uses them: `00-changes`, `01-intent`, `02-requirements`, `03-architecture`, `04-controls`, `05-src` read as `01-changes`, `10-intent`, `11-requirements`, `12-architecture`, `14-operations/controls`, `13-source`. The alias adds no phase.
5. **Release's two lists, reviewed.** They agree with this file except: (a) Cases live in the concern folders' `test-cases` in the newest layout, not only in the Change folder, and all of them are PLAN, so DO never edits an agreed Case; (b) `00-backlog`, `02-learnings/{research,rehearsals,reviews}` and the package root files were named by no list, so they would be reported red; this file assigns them; (c) `act.md` stays an ACT file, as in release's current map.
6. **CHECK has no row**, as release says. `14-operations/runs` is evidence of a control's runs and is named by no row, so a merge that carries it is reported with its paths and is red, as release wants for what the files cannot place.

## The two open questions

1. **Does `do.md` count as DO-side outside the source folders? Yes.** It records what the DO built and is written in the DO. It is the one DO file in a Change folder; every other file in a Change folder is PLAN, and `act.md` is the ACT's. The row `01-changes/*/do.md` is longer than `01-changes`, so it wins.
2. **Which phase writes `14-operations`?** Recommended, in two parts. The control records and review items (`14-operations/controls`, `review-items`) are PLAN: a control is designed and stated there, as a requirement is. The accepted baseline of a ratchet (`baseline.json`) is DO: it is measured by running the built judge, so its first value cannot exist in the PLAN, and it may only shrink as source fixes findings. `14-operations/runs` has no row. The acceptance of a failing control (controls C29) is the adopter's lifecycle and is not decided here.

## What this Change pins (Cases, plain `.test.mjs`)

- T1550: every folder of `package-layout.json` and every child it names resolves to exactly one phase, except `dist` (not committed) and `14-operations/runs`, which are named as unassigned; every package root file does too.
- T1551: the rows are unambiguous (no two rows with one path), a path resolves to its longest row, and a legacy name resolves like its alias.
- T1552: the decisions above, as samples: `do.md` is DO and the other Change files PLAN; `test-cases` in `10`, `11`, `12`, `15` are PLAN and never DO; `13-source/unit-tests` is DO; retros ACT; `baseline.json` DO and `controls/*/CTL*.md` PLAN; `runs` unassigned.

All three are RED against `main`: the file does not exist.

## Questions for the CPO

1. Question 2 above: control records PLAN and baselines DO, with `runs` unassigned. If the CPO rules otherwise, the file changes in one row.

## Not in this Change

No code, no resolver script (the matcher stays release's, and a Case of theirs holds equality with this file), no WIRE, no ruleset, no change to the layout check, and no ruling on the expected RED during PLAN, which belongs to the PDCA owner.
