# C76 do

## What the DO added

- `01-intent/I41-ruleset-stands/I41.md`, `02-requirements/F58-ruleset-standing/F58.md`, `03-architecture/A53-ruleset-standing/A53.md` and `04-controls/CTL13-stand-ruleset/CTL13.md`, each equal to its draft in `interface.md` (the control is preventive, has release/I41 and declares `status: implemented`).
- `05-src/stages/stages.json`: Integrating, its three parts, Promoting and Publishing declare `standing` (`control` release/CTL13, `enforcement` active, `bypass` empty).
- `05-src/stages/judge.mjs`: for each branch ruleset the judge reads the stage's `standing` and fails when the stage declares none, when the source's `enforcement` is not the declared one, when its bypass list is not the declared one, or when the control is undeclared or has no Intent. Publishing is judged the same way under the Promoting job. The refs and the target are judged as before.
- T972 to T974 renamed from `.red.mjs` to `.test.mjs`. All three are green.
- The shared fixtures (`C35-stages/helper.mjs`, `C70-stages-declared-rules/fixtures.mjs`) supply release/CTL13 with release/I41 and the `standing` of each stage. Nothing else in an old Case changed.

## Checked beside the Cases

- The Cases runner (`engineering/cases/cases.test.mjs`): 224 tests, 212 pass, 12 fail; the 12 are the unnamed Cases of `collector-capability/00-changes/C15-collector-capability` (T268 to T279), which fail on `main` too.
- The CLI judge passes Integrating, Collecting, Hotfixing, Wiring and Promoting on the real tree. `main`'s judge ignores `standing`, so the PROMOTION is judged green by it as well.
- Nothing is loaded, installed or wired. The live rulesets are unchanged.
