# C81 do

## What the DO added

- `01-intent/I46-thread-resolution/I46.md`, `02-requirements/F63-thread-resolution/F63.md`, `03-architecture/A58-thread-resolution/A58.md` and the amended `04-controls/CTL10-approve-integration/CTL10.md`, each equal to its draft in `interface.md`. CTL10 now has release/I36 and release/I46 and keeps `status: implemented`.
- `05-src/wiring/rulesets/integrating.json`: `required_review_thread_resolution` true in the `pull_request` rule. Every other setting, the three targets, the status checks and the empty bypass list are unchanged.
- `05-src/stages/stages.json`: the same value in the Integrating declaration, so `verify Stages` finds the source and the declaration in agreement. The judge itself is untouched.
- T1042 to T1045 renamed from `.red.mjs` to `.test.mjs` beside their elements, T1046 and T1047 in this folder; all six are green.

## Old Cases the DO amended

- release/T860 (`04-controls/CTL10-approve-integration`): `has` is now `['release/I36', 'release/I46']`; it no longer compares `CTL10.md` to the C66 draft.
- release/T862 and release/T863 moved from `00-changes/C66-integration-approval` to `04-controls/CTL10-approve-integration`, beside the control they test (the lifecycle contract of the CTO investigation). T862 no longer compares `integrating.json` to the C66 draft and asserts the settings it names instead, and also that last-push approval stays off. T863 is unchanged.
- No Case was skipped. T1047 holds this: it fails if T860 or T862 is gone, skipped, or still reads the C66 draft.

## Checked beside the Cases

- The Cases runner: 237 tests, 225 pass, 12 fail; the 12 are the unnamed Cases of `collector-capability/00-changes/C15-collector-capability` (T268 to T279), which fail on `main` too.
- The CLI judge passes on the real tree.
- Nothing is loaded, installed or wired. The live `integrating` ruleset is unchanged. Loading CTL10, with thread resolution, stays the Owner's step.
