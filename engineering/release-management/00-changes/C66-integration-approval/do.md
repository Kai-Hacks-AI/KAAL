# C66 do

## What the DO added

- `01-intent/I36-integration-merge-needs-approval/I36.md` and `04-controls/CTL10-approve-integration/CTL10.md`, each equal to its draft in `interface.md`.
- `05-src/wiring/rulesets/integrating.json`: the `pull_request` rule beside the status checks (one approving review, a stale approval dismissed on push, no Code Owner review, no last-push approval, no thread resolution), equal to the draft. The empty bypass list and the status checks are unchanged. `collecting.json`, `hotfixing.json` and `wiring.json` are untouched.
- `05-src/stages/stages.json`: the Integrating stage declares the `pull_request` rule, traced to release/CTL10, with the same settings as the source (the format release/C70 defined). The CLI judge passes Integrating, Collecting, Hotfixing, Wiring and Promoting on the real tree.
- T860 to T864 renamed from `.red.mjs` to `.test.mjs`. All five are green.
- The shared helper of release/C35 (`helper.mjs`) supplies release/CTL10 with release/I36 among the controls the judge reads. release/T481 expects the approval rule on Integrating beside its status-check rule; release/T482 does not count that one rule as a legacy control (it stays a finding anywhere else, and a second one on Integrating). T483, T487, T511 and T512 pass again with the control in the helper and are otherwise unchanged.

## A departure from the PLAN, and why

The PLAN said a `status` line waits for release/C62. release/C62 is on `main`: `status` is mandatory on a control, and the finder refuses a control without it. So `CTL10.md` declares `status: implemented`, the status a control has on `main` (DIRT: Implemented only; Running needs the Owner's loading and a real refusal; Tested needs the failure evidence listed in `change.md`). The draft in `interface.md` carries the same line, so T860 still compares the file to its draft, and T864 now requires the line where it forbade it.

## Checked beside the Cases

- The Cases runner (`engineering/cases/cases.test.mjs`): 226 tests, 214 pass, 12 fail; the 12 are the unnamed Cases of `collector-capability/00-changes/C15-collector-capability` (T268 to T279), which fail on `main` too.
- Nothing is loaded, installed or wired. The live `integrating` ruleset is unchanged. Approver login, the unattributed-changes setting and hotfix latency stay open for the Owner (`change.md`, Left open).
