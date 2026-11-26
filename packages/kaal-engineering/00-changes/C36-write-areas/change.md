# C36 change

Asked by release through the coordinator (26 Nov), who say the CPO and the Owner placed the contract with Engineering. This is Engineering's answer: the lists reviewed, the contract as one data file, and the two open questions answered. The recommended answers are decisions for the CPO; the DO follows what is approved.

## The answer in six lines

1. **One data file.** `skills/kaal-engineering/references/write-areas.json`, beside `package-layout.json`. Rows are `{ path, phase }`, paths relative to a capability root in the newest layout. A path belongs to the phase of the longest row it lies under; a row matches whole segments, and `*` inside a segment stands for any characters of that segment. A path no row names belongs to no phase and is reported, never guessed. Release's `write-map.json` reads this file and keeps no phase rows of its own.
2. **The areas are exclusive and exhaustive over the layout.** PLAN: `00-backlog`, `02-learnings/research`, `rehearsals`, `reviews`, `10-intent`, `11-requirements`, `12-architecture` and `15-defects` with their Cases and review items, `14-operations/controls` and `14-operations/review-items`. DO: `13-source` (source, scripts, workflows and the unit tests inside it), `14-operations/controls/*/baseline.json`, and the package root files. ACT: `02-learnings/retros`. **`01-changes` is kaal-change's.** Kai (26 Nov): kaal-change takes control of the Change folder and its PDCA, so C36 does not lay it out. Until kaal-change publishes its layout, `01-changes` carries three rows marked `interim` and `owner: kaal-change` that copy what release's map says today: the folder PLAN, `*/do.md` DO, `*/act.md` ACT. kaal-change replaces those rows.
3. **A review item follows its parent folder's phase.** `review-items` in `10`, `11`, `12`, `15` is PLAN, in `13-source` DO, in `14-operations` PLAN.
4. **Legacy names are a short alias list in the same file**, marked legacy and removed with the migration of the last capability that uses them: `00-changes`, `01-intent`, `02-requirements`, `03-architecture`, `04-controls`, `05-src` read as `01-changes`, `10-intent`, `11-requirements`, `12-architecture`, `14-operations/controls`, `13-source`. The alias adds no phase.
5. **Release's two lists, reviewed.** They agree with this file except: (a) Cases live in the concern folders' `test-cases` in the newest layout, not only in the Change folder, and all of them are PLAN, so DO never edits an agreed Case; (b) `00-backlog`, `02-learnings/{research,rehearsals,reviews}` and the package root files were named by no list, so they would be reported red; this file assigns them; (c) `act.md` stays an ACT file, as in release's current map.
6. **CHECK has no row**, as release says. `14-operations/runs` is evidence of a control's runs and is named by no row, so a merge that carries it is reported with its paths and is red, as release wants for what the files cannot place.

## The two open questions

1. **Does `do.md` count as DO-side outside the source folders?** It is inside a Change folder, so the answer is kaal-change's, not C36's. Interim, `do.md` stays the one DO file (as in release's map) so no DO pull request is red meanwhile. Engineering has handed kaal-change a proposal: split the folder by phase (the record at the root and `plan/` PLAN, `do/` DO, `check/` CHECK, `act/` ACT), with flat files legacy for Changes in flight.

2. **Which phase writes `14-operations`?** Recommended, in two parts. The control records and review items (`14-operations/controls`, `review-items`) are PLAN: a control is designed and stated there, as a requirement is. The accepted baseline of a ratchet (`baseline.json`) is DO: it is measured by running the built judge, so its first value cannot exist in the PLAN, and it may only shrink as source fixes findings. `14-operations/runs` has no row. The acceptance of a failing control (controls C29) is the adopter's lifecycle and is not decided here.

## The pull request types and their areas

Kai (26 Nov) asked for the different PR templates mapped, WIRE and HOTFIX included. The file carries a `pullRequests` list, one row per template TYPE, with the areas a pull request of that type may carry:

| TYPE | May carry | How it is recognised | Note |
| --- | --- | --- | --- |
| PLAN | PLAN | its paths all lie in PLAN | |
| DO | DO | its paths all lie in DO | |
| ACT | ACT | its paths all lie in ACT | a retro; its own pull request, never combined with a DO |
| SYNC | nothing of its own | no own path: everything arrived from main | the Dispatcher's `SYNC` |
| PROMOTION | PLAN, DO and ACT, as already judged in the collector | the collector's paths reach main | a transport; nothing new is written, so mixed is expected |
| HOTFIX | PLAN and DO | the branch `hotfix/*`, never the title or body | bounded by its own validity rule: one Defect, at least one Test Case, RED on main, GREEN on the hotfix. The Defect and its Case lie in PLAN paths, the fix in DO paths, so paths alone would read it as mixed |
| WIRE | no package area | the branch `wire/*` | writes only the declared delivery locations (release's `delivery-locations.json`, A67: `.github`, `.githooks`, `.kaal`, `.agents`, `.claude`), which lie outside the capability roots; its contract is release's |

PLAN, DO and ACT are the three product phases. SYNC and PROMOTION move content that was already judged. HOTFIX crosses the phases and WIRE leaves the package, so each is told apart by its branch class, as release's wire and hotfix classes are. The DO of this Change converts neither.

## What this Change pins (Cases, plain `.test.mjs`)

- T1550: every folder of `package-layout.json` and every child it names resolves to exactly one phase, except `dist` (not committed) and `14-operations/runs`, which are named as unassigned; every package root file does too.
- T1551: the rows are unambiguous (no two rows with one path), a path resolves to its longest row, and a legacy name resolves like its alias.
- T1552: the decisions above, as samples: in a Change folder `do.md` is DO and `act.md` ACT, as interim rows owned by kaal-change, and every other file is PLAN; `test-cases` in `10`, `11`, `12`, `15` are PLAN and never DO; `13-source/unit-tests` is DO; retros ACT; `baseline.json` DO and `controls/*/CTL*.md` PLAN; `runs` unassigned.
- T1553: the `pullRequests` list names the seven TYPEs; PLAN, DO and ACT each may carry only their own phase, SYNC nothing of its own, PROMOTION all three, HOTFIX PLAN and DO and is recognised by its branch, WIRE no package area and names release's delivery locations.

All four are RED against `main`: the file does not exist.

## Questions for the CPO

1. Question 2 above: control records PLAN and baselines DO, with `runs` unassigned. If the CPO rules otherwise, the file changes in one row.
2. **The interim `01-changes` rows.** Agree to carry release's current reading (folder PLAN, `do.md` DO, `act.md` ACT) as `interim`, owned by kaal-change, until kaal-change's layout replaces it.

## Not in this Change

No code, no resolver script (the matcher stays release's, and a Case of theirs holds equality with this file), no WIRE, no ruleset, no change to the layout check, and no ruling on the expected RED during PLAN, which belongs to the PDCA owner.
