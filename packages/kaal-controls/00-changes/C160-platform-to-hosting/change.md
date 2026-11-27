# C160 change

## PLAN

1. Add the Case T1710 under controls/N8 (plain `.test.mjs`, never renamed, package-relative like T1574). It reads every `.mjs` of `skills/kaal-controls/scripts` and fails on a file system, process or operating system import, on a `node:path` import other than `posix`, and on line-ending handling (`\r`, `EOL`). It is RED on the collector (ten lines in five files) and is run GREEN against an uncommitted throwaway rewrite.
2. Amend controls/N8 by one sentence: the scripts do no platform work of their own (no file system, process, operating system or line-ending code); what they judge comes in as text from hosting, with `/`-separated, repository-relative paths.
3. No script, Skill word or record change in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. The semantic functions (`findControls`, `registryAt`, `findEvidenceDue` and the like) keep taking `{path, text}` entries and return what they return today. Their callers change.
2. The reading moves out of the scripts into hosting's functions: the directory walks and file reads of `check-controls.mjs`, `evidence.mjs` and `find-controls.mjs` and the file read of `judge-mode.mjs` use hosting's `read`, `list` and `readFile`; the Git read of `registry.mjs` uses hosting's `readRevision`. Each returns files keyed by a `/`-separated relative path, which is the path form the `posix` comparison in `recognize-adapter.mjs` assumes (that comparison is import-specifier syntax and stays).
3. Line endings: hosting hands over text; controls does not normalise it. If hosting's text can still carry `\r\n`, that is a hosting gap (design question 2), not a controls fix.
4. The `node_modules` and `.git` skips and the extension filters stay in controls only as a list of what the check judges (a name filter on paths, no walking).
5. T1710 GREEN; the package suite GREEN and unchanged in what it asserts. A mutation, as in C25 and C159: one file system import put back in a script and one `\r\n` replace put back, each alone turns T1710 RED.

## ACT

A retro entry in the collector.

## Design questions, with recommendations

1. **How controls reaches hosting.** Hosting is TypeScript and controls ships plain `.mjs`. Recommend the entry points that read (CLIs and thin runners) import hosting's functions, and the judging functions stay pure over `{path, text}`. Hosting is an allowed dependency of the package (controls/N8); it is then declared in `package.json`. Hosting to confirm the entry points are consumable from plain `.mjs` as published.
2. **Line endings and path form.** Recommend hosting guarantees `/`-separated, repository-relative paths and, where a check needs line-stable text, offers it; controls then holds no normalisation. Hosting to confirm what `read` and `readRevision` guarantee today; any gap is a hosting Change that this DO waits on.
3. **Scope.** `judge-ratchet.mjs` splits its history text on `\n`: that is the format of the record it judges, not a platform matter, and stays.
4. **Order.** Recommend this Change before the station split and the metadata Changes, since all three touch the same scripts and the package must be scrubbed once.

## PLAN amendment (the callers do not move first)

The DO items 1 to 4 above are replaced by this. The workflows (`codeql.yml` twice and `verify-workflow-names.yml`) run `judge-mode.mjs` as a command, the Engineering control check and Release's Cases run `check-controls.mjs` and `find-controls.mjs` as commands, and Engineering moves its callers to hosting in its own Changes, each with the Owner's go. So the DO takes the file reading out of what the package publishes without breaking one of them:

1. The five scripts that read (`judge-mode`, `check-controls`, `evidence`, `find-controls`, `registry`) are split. Their library moves to `scripts/lib/<same name>.mjs` and is pure: it takes `{path, text}` entries or parsed values and reads nothing. The scripts that import them (`adapter.mjs`, `check-controls`, `evidence`, `registry`) import the new paths. `lib/evidence.mjs` also exports `parseRecords(text)` (the text of a records file to a list; one object is a list of one), which the shim's `readRecords` then calls, so a caller that reads the file with hosting parses it with the library (asked by Engineering C45). `registryAt(files, station)` takes `{path, text}` entries; a caller builds them from what hosting reads.
2. The file at the old path stays as a deprecated shim, with the command line, the file reading, the line endings and the Git read as they are today, importing from `./lib`. It says `DEPRECATED shim` in its first lines. Nothing about any workflow or caller changes, and no WIRE is touched.
3. `package.json` `files` names the five shims with a `!` entry (`!skills/kaal-controls/scripts/judge-mode.mjs` and so on), so that none is published. The Case for the published list is the one below.
4. The references of the Skill (`enforcing-controls.md`, `declaring-controls.md`, `modes.md`, `judging-status.md`) stop promising the commands and name the library functions.
5. T1710 is amended to check the published list: the scripts less the shims `files` leaves out, and it fails if a left-out file is absent or not marked as a deprecated shim. RED on the collector for the same ten lines; GREEN after the DO. The package suite stays GREEN, and the Cases that run a command keep running it, against the shim at the old path.
6. Requirements amended: controls/N8 (one sentence: the shim rule), controls/F21 (the command line is a deprecated shim; the library is `lib/check-controls.mjs`) and controls/F25 (the registry of a station is a function over the files of a ref; reading the ref is a shim). The package no longer promises the commands. F15 needs no change: its Cases run the finder command at the old path, which the shim keeps.
7. Follow-up Change, after Engineering's hosting-based callers are on main: delete the shims and retarget the Cases that run a command to the library functions.
8. A mutation, as in C25 and C159: a file system import put back in a published script, and a shim left out of `files`, each alone turns T1710 RED.

## PLAN amendment 2 (two Cases that expected the old shape)

The DO, run on the collector, turns two older Cases RED that the first amendment did not name: controls/T591 (under F18: `files` is exactly `['skills']`) and controls/T479 (under A8: the finder file at `scripts/find-controls.mjs` imports only `fs`, `path` and `url`). Both expected the shape this Change replaces. They are amended here, before the DO, in their own PR:

- F18 and T591: `files` holds `skills` and, as `!` entries, the deprecated shims it leaves out.
- A8 and T479: the finder is the library `scripts/lib/find-controls.mjs` and imports nothing at all. The command line entry is the deprecated shim at the old path, which imports it.

Nothing else about either Case changes.

### PLAN amendment 2, reconciled with C162

F18 and T591 now state both contracts: `files` is `skills` plus the `!` shim entries (this Change), and `publishConfig` is `{access: public}` (C162, #2841). Neither amendment drops the other. T591 needs both package.json changes to be GREEN; the C160 DO carries the identical `publishConfig` line so the collector stays GREEN on its own, and git merges the identical line cleanly at promotion.

## DO

The five scripts that read files now have a pure library under `skills/kaal-controls/scripts/lib/` (`find-controls`, `check-controls`, `evidence`, `registry`, `judge-mode`): each takes the files as a map of path to bytes and imports no `fs`, `child_process`, `os` or platform path code. The files at the old paths are DEPRECATED shims that import the library and keep the command line, the directory walk, the git read and the line-ending normalisation; `package.json` `files` leaves them out with `!` entries. The references name the library functions; `--records` stays mentioned for the shims because the older Case T1090 asks for it. `publishConfig` `{access: public}` is carried identically to C162 (amendment 2).

Result: T1710, T591 and T479 GREEN; the package suite 116 of 116 GREEN. Mutations, each alone turns T1710 RED: an `fs` import back in a library file; a shim dropped from `files`.

Follow-up Change (later): delete the shims once engineering's hosting-based callers (C45, #2843) are on main. Promotion note: C161 also edits `find-controls.mjs`; expect a conflict to reconcile (the stations input and the library move).

DO finding (Engineering check on the first push): release/T1431 runs the workflow's own steps with only `judge-mode.mjs` and `ratchet.mjs` fetched from another revision, so a `judge-mode.mjs` shim that imports `./lib/judge-mode.mjs` was UNKNOWN there. The `judge-mode.mjs` shim therefore keeps its own copy of `judgeMode` (nine lines, importing only `./ratchet.mjs`) and goes away with the shim; the other shims import the library. Release's Case is not changed. The engineering Cases that run on this tree are GREEN here apart from environment failures (`kaal-core` not built in this sandbox).

## Promotion order (CTO)

C160 promotes before C161 (controls/C161). C160 defines the library layout under `scripts/lib/`; C161 then merges main once in its collector and resolves four files (`scripts/find-controls.mjs`, `scripts/registry.mjs`, `references/enforcing-controls.md`, N8): the stations input goes into the library functions (`findControls(files, { stations })`, `registryAt(files, station, stations)`), the shims keep `--stations`, N8 keeps both paragraphs. The resolved tree is on branch `claude/project-thread-063rup-c160-c161-integration`: package suite 117 of 117 GREEN, release/T1431 GREEN. KAAL's callers pass KAAL's stations in engineering's Change that adopts the package (C45).
