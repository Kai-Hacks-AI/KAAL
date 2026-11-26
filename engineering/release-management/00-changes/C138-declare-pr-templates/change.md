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

1. **Regression.** I ran the Cases runner against sources with the declarations in place: four Cases fail, T640 (ACT), T650 (SYNC), T660 (PROMOTION) and T830 (HOTFIX), because each pins the source text equal to the draft of its own old Change, and the declaration line is not in that draft. Their expectation has to change, so the change is made **in this PLAN**, not in the DO: each of the four now takes an optional declaration line off the front before it compares the text to its draft (one line, `release/C138`). They pass today and after the DO, and T1540 is what demands the declaration. The DO changes no Case.
2. **Accept list.** None.
3. **Feature.** T1540.

## Who owns what

- **Write areas.** PLAN, DO and ACT write areas are mutually exclusive. The DO is confined to source folders, with their implementation unit tests, and works RED to GREEN to refactor against the Cases of the PLAN unchanged. It never changes a PLAN document, an ACT document or an agreed Case; a Case that has to change returns to a PLAN, as it did for the four above.
- **The contract is Engineering's.** Engineering owns this PDCA and write-boundary contract today. This Change redefines none of it and does not copy it into Release; the list in release/C136 is to be read as a request to Engineering, not as a Release rule.
- **Templates are not lifecycle authority.** A template declares the TYPE and the chapters of an envelope. It does not say which phase writes what, and nothing in the declaration is read as such.
- **WIRE and DEFAULT.** Six TYPEs are declared, as agreed with the Owner. The WIRE keeps its own `Source`, `Target`, `Verification` chapters for a separate judge adaptation, and DEFAULT stays unsupported for now.

## Not in this Change

No install (a WIRE), no `.github` edit, no flag, no ruleset, no change to `envelope.mjs` or `templates.mjs`.

## Cases

T1540 is parked `.red.mjs` and becomes `.test.mjs` in the DO.
