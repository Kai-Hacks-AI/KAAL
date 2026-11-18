# C78 do

## What the DO added

- `01-intent/I43-published-tag-immutable/I43.md`, `02-requirements/F60-published-tag/F60.md`, `03-architecture/A55-published-tag/A55.md` and `04-controls/CTL15-hold-published-tag/CTL15.md`, each equal to its draft in `interface.md`. `CTL15.md` declares `status: implemented`.
- `05-src/stages/stages.json`: the Publishing stage declares `rules` (the `update` rule, its settings, traced to release/CTL15). The old `rule` key stays only so main's judge still passes a PROMOTION; it is to go in the later Change that removes the compatibility keys.
- `05-src/stages/judge.mjs`: the Publishing ruleset is compared with the declared list of rules, their settings are compared, and each rule must be traced to a declared control that has an Intent.
- T992 to T994 renamed from `.red.mjs` to `.test.mjs`. All three are green.
- The fixtures of release/C70 and the helper of release/C35 carry release/CTL15.

## Checked beside the Cases

- The Cases runner (`engineering/cases/cases.test.mjs`): 224 tests, 212 pass, 12 fail; the 12 are the unnamed Cases of `collector-capability/00-changes/C15-collector-capability` (T268 to T279), which fail on `main` too.
- Nothing is loaded, installed or wired. The live tag ruleset is unchanged.
