# C36 change

Asked by release through the coordinator (26 Nov), who say the CPO and the Owner placed the contract with Engineering. This is Engineering's answer: the lists reviewed, the contract as one data file, and the two open questions answered. The recommended answers are decisions for the CPO; the DO follows what is approved.

## The answer in six lines

1. **One data file.** `skills/kaal-engineering/references/write-areas.json`, beside `package-layout.json`. Rows are `{ path, phase }`, paths relative to a capability root in the newest layout. A path belongs to the phase of the longest row it lies under; a row matches whole segments, and `*` inside a segment stands for any characters of that segment. A path no row names belongs to no phase and is reported, never guessed. Release's `write-map.json` reads this file and keeps no phase rows of its own.
2. **The areas are exclusive and exhaustive over the layout, and the file says where a path may be written, not whether the write is authorized.** PLAN: `00-backlog`, `02-learnings/research`, `rehearsals`, `reviews`, `10-intent`, `11-requirements`, `12-architecture` and `15-defects` with their Cases and review items, and the control declarations in `14-operations/controls` and `14-operations/review-items`. DO is source only: `13-source` (source, scripts, workflows and the unit tests inside it) and the package root files. ACT: `02-learnings/retros`. Two kinds of row carry no phase: **`01-changes` is delegated to kaal-change** (Kai, 26 Nov), and **`14-operations/controls/*/baseline.json` is an allowance transition owned by Controls** (the CPO, 26 Nov): adopting or reducing an accepted baseline is an authorization, not ordinary implementation permission. A path under a delegated or transition row is reported as such, never read as PLAN, DO or ACT.
3. **A review item follows its parent folder's phase.** `review-items` in `10`, `11`, `12`, `15` is PLAN, in `13-source` DO, in `14-operations` PLAN.
4. **Legacy names are a short alias list in the same file**, marked legacy and removed with the migration of the last capability that uses them: `00-changes`, `01-intent`, `02-requirements`, `03-architecture`, `04-controls`, `05-src` read as `01-changes`, `10-intent`, `11-requirements`, `12-architecture`, `14-operations/controls`, `13-source`. The alias adds no phase.
5. **Release's two lists, reviewed.** They agree with this file except: (a) Cases live in the concern folders' `test-cases` in the newest layout, not only in the Change folder, and all of them are PLAN, so DO never edits an agreed Case; (b) `00-backlog`, `02-learnings/{research,rehearsals,reviews}` and the package root files were named by no list, so they would be reported red; this file assigns them; (c) `do.md` and `act.md` are not named: the Change folder is kaal-change's, so release's two rows for them go to kaal-change.
6. **CHECK has no row**, as release says. `14-operations/runs` is evidence of a control's runs and is named by no row, so a merge that carries it is reported with its paths and is red, as release wants for what the files cannot place.

## The two open questions

1. **Does `do.md` count as DO-side outside the source folders?** No. Source-only DO was agreed, so C36 carries no `do.md` row and no silent exception. The whole Change folder is delegated to kaal-change, who decide where a DO's record goes. Until its layout is published, a path in a Change folder is reported as delegated to kaal-change, not classified. Engineering's proposal to kaal-change is a folder per phase (the record at the root and `plan/` PLAN, `do/` DO, `check/` CHECK, `act/` ACT).

2. **Which phase writes `14-operations`?** The control declarations (`14-operations/controls`, `review-items`) are PLAN. A ratchet's `baseline.json` is not a phase's write area: adopting or reducing an accepted baseline is an allowance transition, which Controls owns, so the file names it and leaves the authorization to Controls (write location is not authorization). `14-operations/runs` has no row. The acceptance of a failing control (controls C29) is likewise the adopter's and Controls', not decided here.

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
- T1552: the decisions above, as samples: every path in a Change folder is delegated to kaal-change and no `do.md` or `act.md` row exists; a `baseline.json` is a transition owned by Controls; `test-cases` in `10`, `11`, `12`, `15` are PLAN and never DO; `13-source/unit-tests` is DO; retros ACT; `controls/*/CTL*.md` PLAN; `runs` unassigned.
- T1553: the `pullRequests` list names the seven TYPEs; PLAN, DO and ACT each may carry only their own phase, SYNC nothing of its own, PROMOTION all three, HOTFIX PLAN and DO and is recognised by its branch, WIRE no package area and names release's delivery locations.

All four are RED against `main`: the file does not exist.

## Questions for the CPO

1. The two rows without a phase: `01-changes` delegated to kaal-change, and `baseline.json` an allowance transition owned by Controls. Controls and kaal-change are asked to confirm their part.
2. Until kaal-change publishes its layout, every Change folder path is reported as delegated, so a Dispatcher reading this file cannot classify a PLAN, DO or ACT by its Change folder files alone. That is the cost of having no silent exception.

## Not in this Change

No code, no resolver script (the matcher stays release's, and a Case of theirs holds equality with this file), no WIRE, no ruleset, no change to the layout check, and no ruling on the expected RED during PLAN, which belongs to the PDCA owner.
