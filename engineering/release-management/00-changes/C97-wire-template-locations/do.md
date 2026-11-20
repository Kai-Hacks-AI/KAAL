# C97 do

The DO adds, from the drafts in `interface.md`: the Requirement `F75.md`; the Target hint of the template source `05-src/wiring/templates/wire.md`, which now points to the declaration of the wirable delivery locations and names no root; T1170 renamed from `.red.mjs` to `.test.mjs`.

## Cases amended

T281 (release/C27): it judges the chapters and the cue of the template source and no longer compares the source with the C27 draft; its unused `draft` helper is gone. T281 and T282 stay green.

## Verified

`node --test engineering/cases/cases.test.mjs`: the same 12 C15 failures as `main` (T268 to T279), nothing else. All CI workflows passed on the merged head.

## Not done here

The WIRE that installs the template (#2046) is a separate pull request and waits for this Change to be on `main`; its copy still holds the old hint until it is recopied from the corrected source.
