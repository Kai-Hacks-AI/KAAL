# C136 change

## PLAN

Records the Defect and its reproducing Case and decides how the remedy reads the final step. The approval of this pull request is the go for the DO. The DO changes the source in `05-src/promotion-raise` and the workflow sources with it; the installed workflows wait for their own WIRE on the Owner's go. No flag, ruleset or required check is touched.

### Which files decide

The collector, read as data at the merge revision, beside the default branch read as data:

1. **The carried Changes.** A Change folder under `<root>/00-changes/` of the collector that the default branch does not hold, for every capability root (`engineering/<x>`, `packages/<x>`). Its id is the `id` in the front matter of its record `C<n>.md`. A folder with no readable id is unreadable.
2. **The ACT of a Change.** A retro under `<root>/02-learnings/retros/` of the collector whose front matter `reflects` names the id.
3. **The collector is ready** when it carries at least one Change and every carried Change is reflected. This is the rule `hold Act` already applies to the same files; the Dispatcher takes it from the same place and does not restate it.
4. **The PROMOTION's title and body come from the records** (the ids and titles of the carried Changes), not from the pull request text.

The title and the body of the merged pull request are not read for the decision. A convention of text is not a control.

### What already ties the phase to directories, and is reused

Nothing here is a new notion; the layout, the isolation controls and the ACT judges already determine it from paths, and the DO reads them and restates none:

- **The layout.** A capability root is a folder of `engineering/` or `packages/` that holds `00-changes` (`capabilityRoots`); a Change is a folder `00-changes/C<n>-...` with its record `C<n>.md` (`changeIdOf`); a retro is a file under `02-learnings/retros/` whose `reflects` names the Change (`retrosOf`, the rule of `hold Act`).
- **Carried Changes.** The Change folders of the collector that main does not hold (`carriedFolders`, the same function `hold Act` uses).
- **Own against inherited paths.** `isolateChanges` over the `before` collector, the `after` merge result and `contained` main attributes every changed path as own or inherited, from files alone (release/C123, CTL33).
- **Which route a path belongs to.** The write map `05-src/phase/write-map.json`, owned by release, one row per route, entries relative to a capability root, matched by `inRoute` of `lib/write-map.mjs` (the matcher `limit Act` uses). Today it has the row `act` (`02-learnings/retros/` and the legacy `act.md` files). The Owner's line of 20 Nov 2026 (release/C110) names the other rows and left each to its own Change: PLAN writes the plan folders and the Cases of the plan folders, DO writes source and the unit tests inside source, not the Cases of the plan.

This Change adds the rows `plan` and `do` to that map and nothing else to it. One point C110 left open and this Change settles on the CPO's review: a DO closes the Cases of its PLAN by renaming `.red.mjs` to `.test.mjs` in the plan folder, so a path that is a Case of a plan folder in its `.test.mjs` form counts as DO work and in its `.red.mjs` form as PLAN work.

### The two facts, both from content

- **Position (where a collector stands).** From the collector's files at a revision: the carried Changes and the retros that reflect them. It can be tested at any revision, with no merge and no pull request: `readyFromFiles({ main, collector })`.
- **Inflow (what a merge brought).** From the paths the merge changed on its own: the `before` collector (the first parent of the merge result), the `after` collector (the merge result) and `contained` (main as the result holds it), the attribution the ACT judges already make (`isolateChanges`: own against inherited). The own paths are classified against the write map: **ACT** when every own path is in the act route (the retros folder and the act files, the row that is there now); **PLAN** when every own path is in the plan route (the plan folders of a capability and the Cases of the Change); **DO** when some own path is in neither route and none is in the act route; **SYNC** when there is no own path (everything came from main); **mixed** when own paths of the act route come with others, or an own path lies under no capability root. The write map gains the rows `plan` and `do` as data in this Change; the DO route is the complement of the two.

The Dispatcher raises when the position after the merge is `ready`; it reports the inflow of every merge. Neither needs the title or the body.

### Decisions

1. **The Defect is release/D19**, with the Case release/T1535 parked RED (`T1535.red.mjs`). It moves to `T1535.test.mjs` with the DO and turns GREEN.
2. **One pure function over two folders**, `readyFromFiles({ main, collector })`, answers `ready` with the carried ids and titles, `not-ready` with the carried ids that no retro reflects, `nothing-carried`, or `unreadable` with the folders whose id cannot be read. It lives in `05-src/promotion-raise`, reads files and imports nothing of Testing or of the ACT judges' code; it reads the same files by the same convention (the record's `id`, the retro's `reflects`) and a Case holds the two readings equal on the same fixture.
3. **The event raise reads files.** The workflow checks out the collector at the merge revision as a folder, as data and never run, beside the default branch, and `dispatch.mjs final` takes the folders (`KAAL_BEFORE_DIR`, `KAAL_COLLECTOR_DIR` for the after, `KAAL_MAIN_DIR` for main and `KAAL_CONTAINED_DIR`), and prints the position and the inflow in its decision. `ready` raises. `not-ready` and `nothing-carried` skip and say why in the terms of the files (the carried Change with no retro) as a notice in the step summary: a merge is never skipped without a report. `unreadable` and `mixed` make the classify job red and name the folder or the paths.
4. **The scheduled raise** (`decide.mjs`) reads the same function in its own DO, so no path of the Dispatcher decides from text. Until then its title and body reading is recorded as the same Defect, not hidden.
5. **Hotfix and wire classes** read their step from the body today. They are not converted here: a hotfix has a Defect record and a Case, a wire has a source and a target, and each is read from files in its own Change after this one.
6. **No title or body fallback.** A body that names an ACT can neither raise nor stop a PROMOTION.

### Cases

- release/T1536 (parked RED now), over fixtures of a before, an after and a contained folder: an own plan path is classified PLAN, an own source path DO, an own retro ACT, a merge of paths main already holds SYNC, a retro together with a source path mixed and red; every event body free text and every title irrelevant.
- release/T1535 (parked RED now), over fixtures of a main folder and a collector folder, every event body free text: a collector whose carried Change is reflected by a retro raises, titled from the records; a carried Change with no retro is quiet and exit 0 and the report names it; a collector carrying one reflected and one unreflected Change is quiet and names the second; a collector carrying nothing (a SYNC) is quiet; a carried folder with no readable id ends non-zero and names the folder.
- `readyFromFiles` and the retro finder of the ACT judges agree on the same fixture (with the DO).
- the workflow source checks out the collector at the merge revision as data and runs nothing from it (with the DO).

### Not in this Change

No WIRE, flag, required check or ruleset change. No conversion of the hotfix and wire classes. No change to what a PROMOTION is or to the seat it takes.
