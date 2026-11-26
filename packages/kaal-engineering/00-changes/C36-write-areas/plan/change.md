# C36 change

Asked by release through the coordinator (26 Nov), who say the CPO and the Owner placed the contract with Engineering. This is Engineering's answer: the lists reviewed, the contract as one data file, and the two open questions answered. The recommended answers are decisions for the CPO; the DO follows what is approved.

## The answer in six lines

1. **One data file.** `skills/kaal-engineering/references/write-areas.json`, beside `package-layout.json`. Rows are `{ path, phase }`, paths relative to a capability root in the newest layout. A path belongs to the phase of the longest row it lies under; a row matches whole segments, and `*` inside a segment stands for any characters of that segment. A path no row names belongs to no phase and is reported, never guessed. Release's `write-map.json` reads this file and keeps no phase rows of its own.
2. **The areas are exclusive and exhaustive over the layout, and a Change folder is organised by phase.** PLAN: `00-backlog`, `02-learnings/research`, `rehearsals`, `reviews`, `10-intent`, `11-requirements`, `12-architecture` and `15-defects` with their Cases and review items, `14-operations/controls` and `14-operations/review-items`, and in a Change folder its record `<id>.md` at the root and the folder `plan/`. DO: `13-source` (source, scripts, workflows and the unit tests inside it), the folder `do/` of a Change (its `do.md`), `14-operations/controls/*/baseline.json`, and the package root files. CHECK: the folder `check/` of a Change (evidence). ACT: `02-learnings/retros` and the folder `act/` of a Change.
3. **A review item follows its parent folder's phase.** `review-items` in `10`, `11`, `12`, `15` is PLAN, in `13-source` DO, in `14-operations` PLAN.
4. **Legacy names are a short alias list in the same file**, marked legacy and removed with the migration of the last capability that uses them: `00-changes`, `01-intent`, `02-requirements`, `03-architecture`, `04-controls`, `05-src` read as `01-changes`, `10-intent`, `11-requirements`, `12-architecture`, `14-operations/controls`, `13-source`. The alias adds no phase.
5. **Release's two lists, reviewed.** They agree with this file except: (a) Cases live in the concern folders' `test-cases` in the newest layout, not only in the Change folder, and all of them are PLAN, so DO never edits an agreed Case; (b) `00-backlog`, `02-learnings/{research,rehearsals,reviews}` and the package root files were named by no list, so they would be reported red; this file assigns them; (c) `act.md` stays an ACT file, as in release's current map.
6. **CHECK has a row, `check/` in a Change folder**, because Kai asked for plan, do, check and act to be separable (26 Nov). Release's classifier knows PLAN, DO, ACT, SYNC today, so a merge that carries only `check/` is `unclassifiable` there until release adds CHECK; nothing in the Dispatcher's decision needs it. `14-operations/runs` is evidence of a control's runs and is named by no row, so a merge that carries it is reported with its paths and is red, as release wants for what the files cannot place.

## The two open questions

1. **Does `do.md` count as DO-side outside the source folders?** Not as an exception any more. Kai (26 Nov): a clean PLAN, DO, CHECK and ACT split depends on how the Change folder is organised, and it can be done cleanly. So the Change folder is organised by phase and `do.md` is a file of the folder `do/`, which belongs to the DO. No row names a single file: each phase owns a folder.

## The Change folder, by phase

```
01-changes/C36-write-areas/
  C36.md          the record (id, title, implements, closes), written in the PLAN
  plan/           PLAN: change.md, gap.md, baseline.md, interface.md, evidence of the expectation, and Cases kept with the Change
  do/             DO: do.md, what was built
  check/          CHECK: the evidence a check supplies and the Change keeps
  act/            ACT: act.md where a retro is not enough (the retro itself is `02-learnings/retros`)
```

Each file maps to exactly one phase, so the rows are folders: `01-changes` PLAN (the record), then the longer rows `01-changes/*/plan`, `do`, `check`, `act`. No row has a file name in it, and release's matcher needs nothing beyond whole segments here.

**What the migration costs.**
- **Existing Change folders stay as they are.** They are history on merged collectors and nothing writes to them again; moving their files changes nothing a judge reads. The record `C<n>.md` stays at the folder root, so everything that finds a Change by its record (`carriedFolders`, `changeIdOf`, the retro `reflects`) is untouched.
- **Changes in flight are flat** (release C136 and C138, and any other open PLAN). Their `do.md` and `act.md` sit in the folder root. Two rows marked `legacy` keep them classifiable (`01-changes/*/do.md` DO, `01-changes/*/act.md` ACT) and are removed when the last flat Change has merged. Without them the DO of such a Change is mixed and red; release's Dispatcher decision is not yet installed, so nothing blocks today.
- **New Changes use the folders from the first PLAN after this one.** This Change is the first: its PLAN files are under `plan/` and its DO writes `do/do.md`. Cost: the folder names in the PLAN, DO and ACT templates and Skills that tell an agent where to write (kaal-engineering's layout reference, the DO and ACT pull request templates, release's `change.md` guidance). The layout reference gains a `changeFolder` section in its DO, and `check-layout` is not asked to enforce it in this Change.
- **Cases kept in a Change folder** (release's `T*.red.mjs` and `T*.test.mjs`) go under `plan/`; Cases of a concern stay in its `test-cases`.
2. **Which phase writes `14-operations`?** Recommended, in two parts. The control records and review items (`14-operations/controls`, `review-items`) are PLAN: a control is designed and stated there, as a requirement is. The accepted baseline of a ratchet (`baseline.json`) is DO: it is measured by running the built judge, so its first value cannot exist in the PLAN, and it may only shrink as source fixes findings. `14-operations/runs` has no row. The acceptance of a failing control (controls C29) is the adopter's lifecycle and is not decided here.

## What this Change pins (Cases, plain `.test.mjs`)

- T1550: every folder of `package-layout.json` and every child it names resolves to exactly one phase, except `dist` (not committed) and `14-operations/runs`, which are named as unassigned; every package root file does too.
- T1551: the rows are unambiguous (no two rows with one path), a path resolves to its longest row, and a legacy name resolves like its alias.
- T1552: the decisions above, as samples: in a Change folder `<id>.md` and `plan/` are PLAN, `do/` is DO, `check/` is CHECK and `act/` is ACT, and a flat `do.md` or `act.md` is a legacy row; `test-cases` in `10`, `11`, `12`, `15` are PLAN and never DO; `13-source/unit-tests` is DO; retros ACT; `baseline.json` DO and `controls/*/CTL*.md` PLAN; `runs` unassigned.

All three are RED against `main`: the file does not exist.

## Questions for the CPO

1. Question 2 above: control records PLAN and baselines DO, with `runs` unassigned. If the CPO rules otherwise, the file changes in one row.
2. **`do.md` and the Change folder.** The CPO's re-review of release C136 (#2552) wanted DO confined to source folders; Kai's answer is a folder per phase instead of an exception. This PLAN follows Kai: `do/`, `plan/`, `check/`, `act/` in each Change folder, the flat files legacy until the last in-flight Change has merged. If the CPO prefers `do.md` to live outside the Change folder, the `do/` row moves with it.

## Not in this Change

No code, no resolver script (the matcher stays release's, and a Case of theirs holds equality with this file), no WIRE, no ruleset, no change to the layout check, and no ruling on the expected RED during PLAN, which belongs to the PDCA owner.
