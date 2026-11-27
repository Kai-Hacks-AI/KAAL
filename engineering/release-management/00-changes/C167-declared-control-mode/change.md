# release/C167: the entries of the replaced checks take their flag from the controls instance

## Reason
Release/C153 replaces four required checks, each first as a detective entry. A detective REPORT ends the job green, so requiring a detective job enforces nothing. Kai's decisions (27 Nov): the switch from detective to preventive is a flag, the controls library reports where the flags stand, the flags live in a file, and KAAL's controls instance owns that file and its values, not Release and not the package. Release only declares its checks as controls and passes the flag through. Release writes no mode logic.

## The contract
Two things are kept apart: the intended mode and the flag that decides whether it applies. C158 takes a requested `mode` and a `boundary.flag`; the flag decides whether that mode applies and never chooses the mode.
- **The intended mode** is declared in the control's own record, in the existing `stations` field (`stations: [<Station>:<mode>]`, read by the controls library's finder). Release owns the records of its controls (CTL23, CTL37 to CTL41, CTL42), so Release owns these declarations: each control declares `preventive` at the station its required check serves, at its flip (a pull request into the default branch is `Promoting`; into `kaal/*`, `Collecting`; into `hotfix/*`, `Hotfixing`; into `wire/*`, `Wiring`). A control with no declaration for the station requests `detective`, which is the only mode a control runs in until its flip; a record that cannot be read answers UNKNOWN. An undeclared control is never preventive. The declarations are read from the base's files, never from the pull request's own copy.
- **The flag** is KAAL's controls instance's: `engineering/14-operations/controls/flags.json` (format and reader by controls/C164). An entry is keyed by control id and place (`source.of(control, place)`, the place being the station of the target) and gives `{name, value}`. The instance owns the file and its values; the first entries and every flip to `on` are a reviewed change of that file on the Owner's go, one per check.
- **The outcome is controls' contract, Release maps it.** controls/C164 (F224 item 7, `decideOutcome`; Cases T1724 and T1726) pins what a missing file, missing entry or invalid value does. An unknown flag never enforces by verdict, and the library sets no exit code of its own: the entry maps the library's `exit` to its job. The table below is that contract as Release consumes it.
- **The shared entry** (`lib/answer.mjs` and the entries of Change Isolation and Promotion Source) does two reads, one validation and one call: the control's declared mode for the station of its target (from the record, through the library's finder) and the control's flag (through `source.of`); `validateFlags({ controls, source })` before anything runs; then `runControl({ mode, boundary: { ..., flag } })` through `toBoundary`. It interprets neither: it never maps a flag value to a mode, never defaults a missing value, and carries no mode literal. It returns `decideOutcome`'s `exit` as the job's exit code and prints its finding.
- **Who decides what.** Release: which mode a control is meant to run in at each station. Controls instance: whether that mode applies now (the flag). C158 and the library: what the combination means, including an unknown flag and the exit. The Owner: each flip, separately per check.
- Check 3 (admission) is not a control and has neither mode nor flag.

### Outcome table (what the CI job shows)
Inputs `file missing`, `entry missing` and `value invalid` behave the same; a file that cannot be parsed counts as every entry missing.

| Declared mode | Flag | Outcome | Enforcement | Exit and job | Verdict record | Finding |
|---|---|---|---|---|---|---|
| preventive | file missing, entry missing, value invalid | CONFIG_FAILED | none | 1, job red, the merge stops as a configuration failure, not as enforcement by verdict | none (no control ran) | `preventive-without-flag:<id>@<place>` |
| detective or none | file missing, entry missing | CONFIG_FAILED | none | 0, job green | none | `no-flag` |
| detective or none | value invalid | CONFIG_FAILED | none | 0, job green | none | `unrecognized-flag` |
| preventive | `on`, verdict FAIL | BLOCKED | authorized | 1, job red | FAIL | none |
| preventive | `on`, verdict PASS | PASSED | none | 0, job green | PASS | none |
| any | `advisory` | PASSED | none | 0, job green | the verdict | none |
| any | `stopped` | not run | none | 0, job green | none | none |
| (no `boundary.flag` at all, legacy) | none | as C158 asked; a block gives BLOCKED | legacy | 1 when it blocks | the verdict | `blocked-without-flag:<id>@<place>` |

Release's entries never take the legacy row: they always validate and pass the flag. A control Release has not flipped declares no `preventive`, so no CONFIG_FAILED red job exists before a check's flip. Not applicable writes no record in any case.

## Acceptance expectations
- An entry passes its control's declared mode for the station of the target, and the flag of the same control and place, to `runControl`, each read from the base's files; a mode or flag in the head's own copy changes nothing about its own run.
- A control with no declared mode requests `detective`; the entry never requests `preventive` for a control whose flip has not been made, always runs `validateFlags` and `toBoundary` (never an absent flag), and never turns a missing value into `off` or `on` itself.
- The job's exit code and finding are exactly the table above, and the entry returns the library's `exit` without changing it.
- No entry names a mode (`detective`, `preventive`, `ratchet`) any more.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1630: the helper passes the control's declared mode for the station of the target and the flag of control and place from the base's `flags.json` into `runControl` after `validateFlags`, and requests `detective` when the declaration is missing. With the file missing, the entry missing or the value invalid, it still goes through `validateFlags` (never an absent flag) and the outcome is the CONFIG_FAILED row of the table, not a pass.
- T1631: one fixture per check family (1, 2 and 4) passes mode and flag through unchanged and decides nothing about them. The table is asserted row by row: declared preventive with the file missing, the entry missing or the value invalid exits 1, job red, writes no verdict record and shows `preventive-without-flag:<id>@<place>`; declared detective (or none) with the same inputs exits 0, job green, writes no verdict record and shows `no-flag` or `unrecognized-flag`; a file that cannot be parsed is every entry missing; preventive and `on` with a FAIL verdict exits 1 (BLOCKED, authorized); with `advisory` it exits 0; with `stopped` the control does not run. Written against controls' T1724 and T1726 and fails if they differ.
- T1632: a head that carries an edited control record or `flags.json` gets the base's mode and flag.
- T1633: not applicable answers zero and writes no record whatever the mode and flag.
- T1634: no entry names a mode literal and none maps a flag value to a mode or sets its own exit code (a ratchet against all three), so the record, the instance and the library are the only sources.
All red until the DO, which waits for controls/C158 and C164 on main.

## DO
Change the shared entry helper and the entries to validate, pass the declared mode and the flag, and return the library's exit; add no `preventive` declaration: a control's `stations: [<Station>:preventive]` is added in the same reviewed change as its flag entry at its flip, so a requested preventive never exists without its flag. No entry of the instance file is written by this Change. The DO renames the parked Cases unchanged. Each Case is green with the package suite.

## After it
ACT, PROMOTION. Then, per check and each on the Owner's separate go: the check's entries in `flags.json` (a reviewed change of the instance file, then flipped to `on`), and the ruleset swap by the Owner. The old workflow keeps running unrequired as the detective comparison.

## Left open (with a recommendation)
- Whether a detective control's missing flag should also turn the job red is the Owner's call on controls/F224 item 4. Here it stays green (`no-flag`), so migration cannot break a job.
- The read of the file at the base goes through Hosting (platform mechanics). Recommendation: the entry's existing Git read of the default branch's tip, the same way the trusted judge reads the checker today.
- The job names at the swap: checks 1 and 3 take the old context name (a rename in the workflow source), checks 2 and 4 are required by their new job names. A separate PLAN, as they are not flags.
- GitHub as a second flag source (through Hosting) is for later, the Owner's remark.

## Not in this Change
No WIRE, ruleset change, required check, flag entry or flip. No interpretation of a flag by Release. The old workflows stay until their swaps.

## Design: split and overlap
Split: none. Nothing here duplicates controls/C158 or C164; this Change only consumes them and declares which controls of Release the flags describe. Dropped: any mode helper, flag interpretation or exit code of Release's own. The declared mode is Release's, the flag is the instance's.
