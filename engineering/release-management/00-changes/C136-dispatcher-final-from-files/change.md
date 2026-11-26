# C136 change

## PLAN

Records the Defect and its reproducing Case and decides how the remedy reads the final step. The approval of this pull request is the go for the DO. The DO changes the source in `05-src/promotion-raise` and the workflow sources with it; the installed workflows wait for their own WIRE on the Owner's go. No flag, ruleset or required check is touched.

### Which files decide

The collector, read as data at the merge revision, beside the default branch read as data:

1. **The carried Changes.** A Change folder under `<root>/01-changes/` (`00-changes/` on a root not yet on the layout) of the collector that the default branch does not hold, for every capability root (`engineering/<x>`, `packages/<x>`). Its id is the `id` in the front matter of its record `C<n>.md`. A folder with no readable id is unreadable.
2. **The ACT of a Change.** A retro under `<root>/02-learnings/retros/` of the collector whose front matter `reflects` names the id.
3. **The collector is ready** when it carries at least one Change and every carried Change is reflected. This is the rule `hold Act` already applies to the same files; the Dispatcher takes it from the same place and does not restate it.
4. **The PROMOTION's title and body come from the records** (the ids and titles of the carried Changes), not from the pull request text.

The title and the body of the merged pull request are not read for the decision. A convention of text is not a control.

### Write boundaries, one positive list per phase, in the newest numbering

The contract that says what each phase writes is Engineering's (the CPO and the Owner, 26 Nov 2026); this Change does not define it in Release. The lists below are what the Dispatcher needs from it, stated so Engineering can confirm or correct them, and the write map holds them as data. The three write areas are mutually exclusive, and DO is confined to source folders with their implementation unit tests, working RED to GREEN to refactor against unchanged Cases; it never changes a PLAN document, an ACT document or an agreed Case. Each phase owns an explicit set of paths. A path that no list names belongs to no phase: there is no catch-all, and in particular DO is not "everything else". Entries are relative to a capability root, as in `write-map.json`, and use the layout of engineering (`packages/kaal-engineering/skills/kaal-engineering/references/package-layout.json`, release/C27 of engineering): `00-backlog`, `01-changes`, `02-learnings`, then `10-intent`, `11-requirements`, `12-architecture`, `13-source`, `14-operations`, `15-defects`.

- **PLAN** writes what states the expectation: the documents of its Change folder (`01-changes/*/C*.md`, `baseline.md`, `change.md`, `interface.md`, `gap.md`, `evidence.md`), the Cases of the Change (`01-changes/*/T*.test.mjs` and `T*.red.mjs`), and the sources of the expectation: `10-intent/`, `11-requirements/`, `12-architecture/` and `15-defects/` with their Cases. The Cases are motivated by those; they are the agreed expectation.
- **DO** writes what satisfies the Cases unchanged: `13-source/` only: source and the implementation unit tests inside it. A DO delivers nothing outside the source folders. Engineering's file (C36) splits a Change folder by phase, with `plan/`, `do/`, `check/` and `act/` as folders; no row names a file, and flat `do.md` and `act.md` of Changes in flight stay classifiable through two rows Engineering marks legacy. A DO never edits a Case of its PLAN. If the expectation has to change, the work returns to a PLAN.
- **ACT** writes reflection only: `02-learnings/retros/` and `01-changes/*/act.md`.
- **CHECK** is a fourth phase value in Engineering's file, for the folder `check/` of a Change. The classifier knows PLAN, DO, ACT and CHECK, and a merge that only changes `check/` is classified CHECK, not unclassifiable.
- **`14-operations`** (the controls) has no row in this Change. Engineering settles its classification and the authoritative write map; Release consumes both and, until then, reports its paths as unclassifiable and guesses nothing.

**Legacy names.** Release's own capability still uses the earlier numbering (`00-changes`, `01-intent`, `02-requirements`, `03-architecture`, `04-controls`, `05-src`), as do capabilities that have not migrated. The Owner's rule is target over legacy, so the rows are written in the newest numbering only; a root that holds `00-changes` is read through a short alias list in the same file (`00-changes` for `01-changes`, `01-intent`, `02-requirements`, `03-architecture` for `10-intent`, `11-requirements`, `12-architecture`, `05-src` for `13-source`), marked legacy, and removed with the migration of the last such capability. The alias list is data in `write-map.json`, not code, and it adds no phase. The discovery of Change folders (`capabilityRoots`, `carriedFolders`) today reads `00-changes` only, which already makes a capability with `01-changes` (Testing) invisible to `hold Act`; the DO reads both names from one place.

Engineering takes the contract as data in `references/write-areas.json` (engineering C36, #2567): rows `{path, phase}`, the longest row wins, a path no row names belongs to no phase. This Change therefore adds no `plan` or `do` row of its own: the DO reads the PLAN and DO areas from that file once it is on `main`, and keeps only its `act` row until then. Where Engineering's file and the lists above differ, the file stands; Engineering also settles `do.md`, `14-operations` and the root files, and Release asks for no DO permission outside the source folders. Its matcher `inRoute` matches whole segments only (`*` is exactly one segment), so `C*.md` and `T*.test.mjs` need a small extension to a `*` inside a segment; the DO adds it with its own Case. Capability layouts that keep source elsewhere have no `do` row until they are on the layout, and their paths are then reported, not guessed.

### Cases keep one identity; the lifecycle is a prerequisite, not decided here

The CPO's direction: a Case keeps the same identity, path and content in every phase. Testing reports the factual verdict of a Case; Release interprets it for the phase. In a PLAN, the expected RED of a new or changed Case is evidence of an unmet expectation (not UNKNOWN, a broken Case or an unrelated regression). In a DO or an ACT, a RED applicable Case fails the control. This Change does not institutionalize the `.red.mjs` to `.test.mjs` rename, and its rows, its classifier and its Cases know no such rename: both file forms of a Case are PLAN work.

What is missing is the mechanism that lets a PLAN pull request carry an expected-RED Case without the lanes failing it, and the phase-specific interpretation of RED by Release. That is a **prerequisite Change**, not introduced here. Its owner is Engineering, which holds the PDCA and write-boundary contract today (the Owner, 26 Nov 2026): it is routed to Engineering, not held for a future Process capability and not given a parallel authority in Release. Testing gives the factual verdict of a Case; Engineering's contract says how a phase reads it (a PLAN counts an expected RED as met, a DO or an ACT fails on a RED applicable Case); Release consumes that reading in its controls (`hold Act`, this Dispatcher) and defines nothing of it. Until it exists the Cases of this PLAN stay in the parked form, the one mechanism the lanes have today, as a carrier and not a model. The DO of this Change is held until it exists.

### The two facts, both from content

- **Position (where a collector stands).** From the collector's files at a revision: the carried Changes and the retros that reflect them. It can be tested at any revision, with no merge and no pull request: `readyFromFiles({ main, collector })`.
- **Inflow (what a merge brought).** From the paths the merge changed on its own: the `before` collector (the first parent of the merge result), the `after` collector (the merge result) and `contained` (main as the result holds it), the attribution the ACT judges already make (`isolateChanges`: own against inherited). Each own path is matched against the positive lists above. **PLAN**, **DO** or **ACT** when every own path lies in that one route; **SYNC** when there is no own path (everything came from main); **mixed** when own paths lie in more than one route; **unclassifiable** when an own path lies in no route. Mixed and unclassifiable are reported with their paths, and the classify job is red; neither is guessed into a phase.

The Dispatcher raises when the position after the merge is `ready`; it reports the inflow of every merge. Neither needs the title or the body.

### Eligibility is not authorization

`ready` makes the collector **eligible** to have its PROMOTION raised. The Dispatcher raises a pull request and nothing more: the merge of that PROMOTION stays with review, the rulesets and the Owner, as today. The decision it prints says `raise` or why not; it carries no approval and no merge action, and a Case holds that.

### Decisions

1. **The Defect is release/D19**, with the Cases release/T1535 and release/T1536 as its tests. The record holds no stored status; confirmed is derived from the Cases' observed verdict. The Cases are not renamed by the DO (see above).
2. **One pure function over two folders**, `readyFromFiles({ main, collector })`, answers `ready` with the carried ids and titles, `not-ready` with the carried ids that no retro reflects, `nothing-carried`, or `unreadable` with the folders whose id cannot be read. It lives in `05-src/promotion-raise`, reads files and imports nothing of Testing or of the ACT judges' code; it reads the same files by the same convention (the record's `id`, the retro's `reflects`) and a Case holds the two readings equal on the same fixture.
3. **The event raise reads files.** The workflow checks out the collector at the merge revision as a folder, as data and never run, beside the default branch, and `dispatch.mjs final` takes the folders (`KAAL_BEFORE_DIR`, `KAAL_COLLECTOR_DIR` for the after, `KAAL_MAIN_DIR` for main and `KAAL_CONTAINED_DIR`), and prints the position and the inflow in its decision. `ready` raises. `not-ready` and `nothing-carried` skip and say why in the terms of the files (the carried Change with no retro) as a notice in the step summary: a merge is never skipped without a report. `unreadable` and `mixed` make the classify job red and name the folder or the paths.
4. **The scheduled raise** (`decide.mjs`) reads the same function in its own DO, so no path of the Dispatcher decides from text. Until then its title and body reading is recorded as the same Defect, not hidden.
5. **Hotfix and wire classes** read their step from the body today. They are not converted here: a hotfix has a Defect record and a Case, a wire has a source and a target, and each is read from files in its own Change after this one.
6. **No title or body fallback.** A body that names an ACT can neither raise nor stop a PROMOTION.

### Cases

- release/T1536 (parked RED now, expected RED as the evidence of the unmet expectation), over fixtures of a before, an after and a contained folder: an own plan path is classified PLAN, an own source path DO, an own retro ACT, a merge of paths main already holds SYNC, a Case in either file form PLAN; a retro together with a source path mixed and red; a path in no route (a control record) unclassifiable, named and red; every event body free text and every title irrelevant.
- release/T1535 (parked RED now, expected RED), over fixtures of a main folder and a collector folder, every event body free text: a collector whose carried Change is reflected by a retro raises, titled from the records; a carried Change with no retro is quiet and exit 0 and the report names it; a collector carrying one reflected and one unreflected Change is quiet and names the second; a collector carrying nothing (a SYNC) is quiet; a carried folder with no readable id ends non-zero and names the folder.
- `readyFromFiles` and the retro finder of the ACT judges agree on the same fixture (with the DO).
- the workflow source checks out the collector at the merge revision as data and runs nothing from it (with the DO).

### Not in this Change

No WIRE, flag, required check or ruleset change. No conversion of the hotfix and wire classes. No change to what a PROMOTION is or to the seat it takes.
