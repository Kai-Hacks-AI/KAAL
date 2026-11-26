# C138 change

## Reason

The registry of `verify Envelope` is read from the templates, and no template declares its TYPE. Before the control's check is installed it should have rules to judge against, or its advisory run is red on every pull request and proves nothing.

## What changes, in the DO (revised: the CPO and Owner returned this Change to PLAN)

1. **Seven TYPEs, WIRE included.** Every template source declares its TYPE with one `<!-- KAAL-PR-template: <TYPE> -->` line, the first line of the file: `PLAN`, `DO`, `ACT`, `SYNC`, `PROMOTION`, `HOTFIX` and `WIRE`. The WIRE keeps its own chapters `Source`, `Target`, `Verification`, in that order; they are preserved, not rewritten.
2. **No first-chapter assumption.** The reader no longer requires a typed template to open with `Change`. A TYPE's chapters are whatever its template declares, in order. `templates.mjs` loses that rule in the DO, and the reader's Cases that pin it (T164 reads DEFAULT as starting with Change and a typed template without it as a finding) are amended in a follow-up commit of this PLAN, once the new rule is fixed with the CTO; the DO changes no Case.
3. **DEFAULT is judged, not skipped.** DEFAULT is an invalid delivery route (release/F19). A pull request that falls to DEFAULT, or a default template file in the repository, is reported by the judge as a finding with its own reason, never as "unsupported" and never silently passed.
4. **One envelope definition, by owner and through Hosting (the Owner's ruling).** Hosting owns GitHub, so the template generator belongs to Hosting. Each capability owns the chapters and content of the TYPEs it owns, and declares them through Hosting; Release owns what is Release's (for example PROMOTION and SYNC content) and verify Envelope. The verifier is a consumer of those declarations, read through Hosting, and carries no hand-kept parallel list of chapters. Release declares only its own types' content in this Change and holds no definition of another capability's type. Engineering's inventory of definitions that already exist (C37, #2590) feeds what Hosting reads; this PLAN fixes no file name or path, and the CTO decides the implementation.
5. `plan.md` and `do.md` get a source under `05-src/wiring/templates/`, copied from the installed ones with the declaration, so the seven declared TYPEs have one source and the WIRE installs by `cmp`. This Change edits no `.github` file.

## Open questions

- **The DO is held on Hosting.** Hosting has not yet named how declarations are made and read. The DO starts when Hosting's generator and declaration form are on the line, and Release's share is its own types' content and the verifier reading the declarations.
- **Pull requests that do not follow their template.** Release's own bodies open with `Reason` and `Change`, so with the registry filled the check says FAIL on them. That is the control working. The flag stays off until the evidence is read.

## FAR

1. **Regression.** I ran the Cases runner against sources with the declarations in place: four Cases fail, T640 (ACT), T650 (SYNC), T660 (PROMOTION) and T830 (HOTFIX), and the reader's Cases around item 2 (T164) change in the PLAN, because each pins the source text equal to the draft of its own old Change, and the declaration line is not in that draft. Their expectation has to change, so the change is made **in this PLAN**, not in the DO: each of the four now takes an optional declaration line off the front before it compares the text to its draft (one line, `release/C138`). They pass today and after the DO, and T1540 is what demands the declaration. The DO changes no Case.
2. **Accept list.** None.
3. **Feature.** T1540.

## Who owns what

- **Write areas.** PLAN, DO and ACT write areas are mutually exclusive. The DO is confined to source folders, with their implementation unit tests, and works RED to GREEN to refactor against the Cases of the PLAN unchanged. It never changes a PLAN document, an ACT document or an agreed Case; a Case that has to change returns to a PLAN, as it did for the four above.
- **The contract is Engineering's.** Engineering owns this PDCA and write-boundary contract today. This Change redefines none of it and does not copy it into Release; the list in release/C136 is to be read as a request to Engineering, not as a Release rule.
- **Templates are not lifecycle authority.** A template declares the TYPE and the chapters of an envelope. It does not say which phase writes what, and nothing in the declaration is read as such.
- **WIRE and DEFAULT.** Seven TYPEs are declared (the Owner's direction), WIRE with its own chapters, and DEFAULT is explicitly judged as an invalid route.

## Not in this Change

No install (a WIRE), no `.github` edit, no flag, no ruleset, no change to `envelope.mjs` or `templates.mjs`.

## Cases

T1540 is parked `.red.mjs` and becomes `.test.mjs` in the DO. It covers all seven TYPEs, the WIRE chapters, and DEFAULT judged as a finding.
