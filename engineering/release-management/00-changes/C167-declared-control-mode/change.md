# release/C167: the mode of a plain pull_request entry is declared in the control's file

## Reason
Release/C153 replaces four required checks, each first as a detective entry. A detective REPORT ends the job green, so requiring a detective job enforces nothing. Going from detective to preventive must be a change of a file that is reviewed and delivered like any other, not a hand edit in a workflow. KAAL lives in files (file level first): a control already declares its stations and their modes in its own record (`stations: [<Station>:<mode>, ...]`, read by the controls library), so the mode of an entry is read from there, through the library, and nowhere else.

## The contract
The entries of checks 1, 2 and 4 (`judge-*.mjs`, `lib/answer.mjs` and the entry helper of Change Isolation and Promotion Source) stop passing a literal `detective` to the adapter. One shared helper asks the controls library for the declared mode of the entry's own control at the station that its pull request target names, and passes it to `runControl`. The pure checks do not change.
- Which station: a pull request into the default branch is the `Promoting` station; into `kaal/*` the `Collecting` station; into `hotfix/*` the `Hotfixing` station; into `wire/*` the `Wiring` station. The stations are the ones the controls library already names.
- Which mode: the declared one. A control that declares no mode for that station, a record that cannot be read, or an unknown station answers `detective` and says so in its log line. A missing declaration never turns an entry preventive (UNKNOWN is never permission, and it never blocks either).
- Where it is read from: the files of the default branch at its tip, the trusted judge, never from the pull request's own copy of the record. A candidate that edits its own control record changes nothing about its own run.
- The record line stays as it is (`control`, `x`, `run`, `sha`, `verdict`, `by`); the mode is in the job log.

## Acceptance expectations
- An entry whose control declares `preventive` at the station of its target fails (non-zero exit) on a REPORT and passes on a PASS.
- The same entry with `detective` declared never fails on a REPORT.
- A missing, unreadable or malformed declaration is `detective`, with the reason in the log line.
- The declaration is read from the default branch's files, not from the head.
- Not applicable still writes no record and never blocks.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1630: the helper returns `preventive` for a control declaring it at the station of a pull request into the default branch, and `detective` for each other situation (not declared, another station, malformed, unreadable).
- T1631: an entry run under `preventive` exits non-zero on a REPORT of its pure check and zero on a PASS, and under `detective` exits zero on both; run on one fixture per check family (Change Isolation, Branching, Promotion Source).
- T1632: the declaration is read from the default branch's files: a head that carries an edited record of its own control gets the default branch's mode.
- T1633: not applicable answers zero and writes no record in every mode.
- T1634: no entry names `detective` or `preventive` as a literal any more (a ratchet against a literal mode in the entries), so the declaration is the only source.
All red until the DO.

## DO
Add the helper over the controls library, change the entries to use it, and keep every declared mode `detective` for now. The DO renames the parked Cases unchanged. Each Case is green with the package suite. The DO changes no declaration: switching a control to `preventive` is its own file change at the swap, with the Owner's go.

## After it
ACT, PROMOTION. Then, per check and each on the Owner's separate go: a one-line change of the control's declared mode (`Promoting:detective` to `Promoting:preventive`, and for lineages `Collecting`), and the ruleset swap by the Owner. The old workflow keeps running unrequired as the detective comparison (release/C153).

## Left open (with a recommendation)
- Whether the declaration change at the swap is a PROMOTION of the control file (the record lives in `04-controls`, not under `.github`, so it is not a WIRE). Recommendation: yes, a one-line PROMOTION per control, the Owner's go each.
- Alignment with controls/C163 (strategy slot, library layers): the helper belongs to the controls library, with the entries as consumers. Recommendation: Release's DO consumes the library function that C163 provides; if it is not on main when the DO starts, the DO carries a small local helper that C163 later replaces, and records that as a defect of order.
- Check 3 (admission) is not a control and has no mode: it is unaffected.

## Not in this Change
No WIRE, ruleset change, required check or flag. No declaration is switched to `preventive`. The old workflows stay until their swaps.

## Design: split and overlap
Split: none. One helper, not one per check, so a fourth check does not copy it.
Overlap: it does not duplicate verify Adapter (which confirms an entry uses the adapter) nor the ratchet strategy of a control (which is not a mode). Dropped: the literal mode in each entry.
