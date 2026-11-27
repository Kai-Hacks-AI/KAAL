# release/C167: the entries of the replaced checks take their flag from the controls instance

## Reason
Release/C153 replaces four required checks, each first as a detective entry. A detective REPORT ends the job green, so requiring a detective job enforces nothing. Kai's decisions (27 Nov): the switch from detective to preventive is a flag, the controls library reports where the flags stand, the flags live in a file, and KAAL's controls instance owns that file and its values, not Release and not the package. Release only declares its checks as controls and passes the flag through. Release writes no mode logic.

## The contract
What controls delivers (controls/C158 flag-status and controls/C164, not Release's to build): `runControl` takes `boundary.flag {name, value}` and only `on` applies the mode; a missing flag runs UNKNOWN and shows as no-flag; the instance file is `engineering/14-operations/controls/flags.json` (`{schema: "kaal-controls/flags@1", flags: [{control, name, value}]}`), read through `scripts/flags.mjs` (`parseFlags(text)`, `flagSource(entries)`, `source.of(controlId)`); one entry per control, keyed by control id.
What Release does:
- The shared entry helper of the replaced checks (`lib/answer.mjs` and the entry of Change Isolation and of Promotion Source) reads the file text at the base of the pull request through Hosting, never the pull request's own copy, calls `source.of(controlId)` of the library and passes the result as `boundary.flag`. It names no mode and decides nothing about what a value means.
- Release declares its controls, so each has an entry in the instance file to be reviewed: check 1 `release/CTL42` and `release/CTL23`, check 2 `release/CTL37`, `release/CTL38` and `release/CTL39`, check 4 `release/CTL40` and `release/CTL41`. Check 3 (admission) is not a control and has no flag.
- The first entries, and every flip to `on`, are a reviewed change of the instance file on the Owner's go, one per check. This Change adds no entry and flips nothing: until an entry exists the entries answer UNKNOWN as no-flag and block nothing in detective use.

## Acceptance expectations
- An entry passes the flag of its own control, read from the base's file, as `boundary.flag`.
- A flag in the head's own copy of the file changes nothing about its own run.
- A missing file, a missing entry or an unreadable file is passed as no flag; the entry never turns a missing value into `off` or `on`.
- Not applicable writes no record in any case.
- No entry names a mode (`detective`, `preventive`, `ratchet`) any more.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1630: the helper passes `{name, value}` from the base's `flags.json` for the entry's own control as `boundary.flag`, and passes none when the entry is missing, the file is missing or unreadable.
- T1631: the entries of checks 1, 2 and 4 pass the helper's flag into `runControl` and nothing else about the mode (one fixture per family).
- T1632: a head that carries an edited `flags.json` gets the base's value.
- T1633: not applicable answers zero and writes no record whatever the flag.
- T1634: no entry names a mode literal (a ratchet against one), so the controls instance is the only source.
All red until the DO, which waits for controls/C158 and C164 to be on main.

## DO
Change the shared entry helper and the entries to pass the flag, nothing more. No entry of the instance file is written by this Change. The DO renames the parked Cases unchanged. Each Case is green with the package suite.

## After it
ACT, PROMOTION. Then, per check and each on the Owner's separate go: the check's entries in `flags.json` (a reviewed change of the instance file, then flipped to `on`), and the ruleset swap by the Owner. The old workflow keeps running unrequired as the detective comparison.

## Left open (with a recommendation)
- The read of the file at the base goes through Hosting (platform mechanics). Recommendation: the entry's existing Git read of the default branch's tip, the same way the trusted judge reads the checker today.
- The job names at the swap: checks 1 and 3 take the old context name (a rename in the workflow source), checks 2 and 4 are required by their new job names. A separate PLAN, as they are not flags.
- GitHub as a second flag source (through Hosting) is for later, the Owner's remark.

## Not in this Change
No WIRE, ruleset change, required check, flag entry or flip. No mode logic of Release's own. The old workflows stay until their swaps.

## Design: split and overlap
Split: none. Nothing here duplicates controls/C158 or C164; this Change only consumes them and declares which controls of Release the flags describe. Dropped: the mode helper of Release that this PLAN first proposed.
