# C77 do

## What the DO added

- `01-intent/I42-check-policy/I42.md`, `02-requirements/F59-check-policy/F59.md`, `03-architecture/A54-check-policy/A54.md` and `04-controls/CTL14-settle-check-policy/CTL14.md`, each equal to its draft in `interface.md`. `CTL14.md` declares `status: implemented`, the status a control has on `main` (DIRT: nothing is running or tested by this DO).
- `05-src/stages/stages.json`: the status-check rule of Integrating, its parts and Promoting declares `settingControls` for `strict_required_status_checks_policy` and `do_not_enforce_on_create`, both traced to release/CTL14.
- `05-src/stages/judge.mjs`: a setting of the status-check rule with no control of its own is a finding; a control declared for a setting the rule does not declare is a finding; each control must be declared and have an Intent.
- T982 to T984 renamed from `.red.mjs` to `.test.mjs`. All three are green.
- The shared fixtures of release/C70 and the helper of release/C35 carry release/CTL14 and its `settingControls`, so the earlier Cases build the same facts as the real tree.

## Checked beside the Cases

- The Cases runner (`engineering/cases/cases.test.mjs`): 224 tests, 212 pass, 12 fail; the 12 are the unnamed Cases of `collector-capability/00-changes/C15-collector-capability` (T268 to T279), which fail on `main` too.
- The new key is ignorable by main's judge, so verify Stages on a PROMOTION still passes.
- Nothing is loaded, installed or wired. The live rulesets and `integrating.json` are unchanged.
