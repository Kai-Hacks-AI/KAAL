# C138 change

## Reason

The registry of `verify Envelope` is read from the templates, and no template declares its TYPE. Before the control's check is installed it should have rules to judge against, or its advisory run is red on every pull request and proves nothing.

## What changes, in the DO

1. Every template source declares its TYPE with one `<!-- KAAL-PR-template: <TYPE> -->` line, the first line of the file: `PLAN`, `DO`, `ACT`, `SYNC`, `PROMOTION`, `HOTFIX`. `wire.md` is not declared: its chapters are Source, Target and Verification, the reader accepts only a typed template that opens with `Change`, and a WIRE stays unsupported (not judged) until the CPO decides its envelope.
2. `plan.md` and `do.md` get a source under `05-src/wiring/templates/`, copied from the installed ones, so that the six declared TYPEs have one source and the WIRE installs by `cmp`, source to `.github`.
3. The chapters of each source are what the TYPE's pull request must hold. Where a source is newer than its installed copy, the source stands and the WIRE installs it; that is the existing delivery order (engineering first, then WIRE), and this Change does not edit a `.github` file.

## Open questions for the CPO, settled by the reading below unless said otherwise

- **Pull requests that do not follow their template.** The bodies of release's own pull requests open with `Reason` and `Change`, not the four chapters of the PLAN template, so with the registry filled the check would say FAIL on them. That is the control working, not a defect of this Change. The DO changes no body and no template to hide it; whether the templates or the bodies move is the CPO's, and it is why the flag stays off until the evidence is read.
- **DEFAULT.** The fallback is a TYPE too (release/F19), but its text is not ours to rewrite in this Change; DEFAULT is left out and stays unsupported, which the judge reports as not judged.

## FAR

1. **Regression.** The template Cases (T43, T50, T91, T98, T130, T150, T281, T282) stay green; each reads one template and a declaration comment must not break them. Where one pins the whole text, the DO amends it and says so in `do.md`.
2. **Accept list.** None.
3. **Feature.** T1540.

## Not in this Change

No install (a WIRE), no `.github` edit, no flag, no ruleset, no change to `envelope.mjs` or `templates.mjs`.

## Cases

T1540 is parked `.red.mjs` and becomes `.test.mjs` in the DO.
