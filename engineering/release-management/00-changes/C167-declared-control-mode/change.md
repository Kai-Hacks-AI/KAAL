# release/C167: the entries of the replaced checks take their flag from the controls instance

## Reason
Release/C153 replaces four required checks, each first as a detective entry. A detective REPORT ends the job green, so requiring a detective job enforces nothing. Kai's decisions (27 Nov): the switch from detective to preventive is a flag, the controls library reports where the flags stand, the flags live in a file, and KAAL's controls instance owns that file and its values, not Release and not the package. Release only declares its checks as controls and passes the flag through. Release writes no mode logic.

## The contract
Two things are kept apart: the intended mode and the flag that decides whether it applies. C158 takes a requested `mode` and a `boundary.flag`; the flag decides whether that mode applies and never chooses the mode.
- **The intended mode** is declared in the control's own record, in the existing `stations` field (`stations: [<Station>:<mode>]`, read by the controls library's finder). Release owns the records of its controls (CTL23, CTL37 to CTL41, CTL42), so Release owns these declarations: each control declares `preventive` at the station its required check serves, at its flip (a pull request into the default branch is `Promoting`; into `kaal/*`, `Collecting`; into `hotfix/*`, `Hotfixing`; into `wire/*`, `Wiring`). A control with no declaration for the station requests `detective`, which is the only mode a control runs in until its flip; a record that cannot be read answers UNKNOWN. An undeclared control is never preventive. The declarations are read from the base's files, never from the pull request's own copy.
- **The flag** is KAAL's controls instance's: `engineering/14-operations/controls/flags.json` (format and reader by controls/C164; `source.of(controlId)` gives `{name, value}`). The instance owns the file and its values; the first entries and every flip to `on` are a reviewed change of that file on the Owner's go, one per check. What a missing, unknown or invalid flag does to a requested `preventive` is controls' contract (controls/C164, requirement F226 items 4 and 6, Cases T1724 and T1725), not Release's: the entry always passes `toBoundary(name, value)`; a missing entry, `null` or a value not understood becomes `{name, value: null}`, and `runControl` then runs the check as a detective, does not block, and records `mode: off`, `applied: false` (the report shows `no-flag`, `blocking: false`). So an unknown flag can never authorize enforcement; it is fail-safe against enforcing. A caller that passes no `boundary.flag` at all is legacy and can block (`blocks-without-flag`): Release's entries never do that. Only `on` blocks; `off` and `advisory` do not; `stopped` means the entry is not run. Release also never requests `preventive` for a control before that control's flip, so no preventive request exists without its flag entry.
- **The shared entry** (`lib/answer.mjs` and the entries of Change Isolation and Promotion Source) does exactly two reads and one call: the control's declared mode for the station of its target (from the record, through the library's finder) and the control's flag (through `source.of`); then `runControl({ mode, boundary: { ..., flag } })`. It interprets neither: it never maps a flag value to a mode, never defaults a missing value, and carries no mode literal.
- **Who decides what.** Release: which mode a control is meant to run in at each station. Controls instance: whether that mode applies now (the flag). C158 and the library: what the combination means. The Owner: each flip, separately per check.
- Check 3 (admission) is not a control and has neither mode nor flag.

## Acceptance expectations
- An entry passes its control's declared mode for the station of the target, and the flag of the same control, to `runControl`, each read from the base's files.
- A mode or flag in the head's own copy of a file changes nothing about its own run.
- A control with no declared mode requests `detective`; the entry never requests `preventive` for a control whose flip has not been made, always passes the flag through `toBoundary` (never an absent flag), and never turns a missing value into `off` or `on` itself. What `runControl` does with a requested `preventive` and a missing, unknown or invalid flag is controls' (F226 items 4 and 6), and Case T1631 asserts it against that contract.
- Not applicable writes no record in any case.
- No entry names a mode (`detective`, `preventive`, `ratchet`) any more.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1630: the helper passes the control's declared mode for the station of the target and `{name, value}` from the base's `flags.json` into `runControl`, requests `detective` when the declaration is missing, and passes no flag when the entry or file is missing or unreadable.
- T1631: the entries of checks 1, 2 and 4 pass the helper's mode and flag into `runControl` and decide nothing about them (one fixture per family); with a declared `preventive` and the flag `on` a REPORT exits non-zero, with the flag `off` it does not block, and with the flag missing, unknown or invalid the result is the one F226 items 4 and 6 pin: the check is judged as a detective, does not block, and the report shows `no-flag` (this Case is written against that contract and fails if the two differ).
- T1632: a head that carries an edited control record or `flags.json` gets the base's mode and flag.
- T1633: not applicable answers zero and writes no record whatever the mode and flag.
- T1634: no entry names a mode literal and none maps a flag value to a mode (a ratchet against both), so the record and the instance are the only sources.
All red until the DO, which waits for controls/C158 and C164 to be on main.

## DO
Change the shared entry helper and the entries to pass the declared mode and the flag, and add no `preventive` declaration: a control's `stations: [<Station>:preventive]` is added in the same reviewed change as its flag entry at its flip, so a requested preventive never exists without its flag. No entry of the instance file is written by this Change. The DO renames the parked Cases unchanged. Each Case is green with the package suite.

## After it
ACT, PROMOTION. Then, per check and each on the Owner's separate go: the check's entries in `flags.json` (a reviewed change of the instance file, then flipped to `on`), and the ruleset swap by the Owner. The old workflow keeps running unrequired as the detective comparison.

## Left open (with a recommendation)
- Missing, unknown and invalid flag behaviour: pinned by controls in controls/C164 (F226 items 4 and 6, T1724, T1725) as fail-safe against enforcing: it never blocks, it shows `no-flag`. Release's earlier wording that a missing flag "never blocks" is replaced by a citation of that contract. The DO waits for controls/C158 and C164 on main.
- The read of the file at the base goes through Hosting (platform mechanics). Recommendation: the entry's existing Git read of the default branch's tip, the same way the trusted judge reads the checker today.
- The job names at the swap: checks 1 and 3 take the old context name (a rename in the workflow source), checks 2 and 4 are required by their new job names. A separate PLAN, as they are not flags.
- GitHub as a second flag source (through Hosting) is for later, the Owner's remark.

## Not in this Change
No WIRE, ruleset change, required check, flag entry or flip. No interpretation of a flag by Release. The old workflows stay until their swaps.

## Design: split and overlap
Split: none. Nothing here duplicates controls/C158 or C164; this Change only consumes them and declares which controls of Release the flags describe. Dropped: any mode helper or flag interpretation of Release's own. The declared mode is Release's, the flag is the instance's.
