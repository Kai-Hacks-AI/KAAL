# C56 change

## PLAN

1. Add the drafts in `interface.md`: the control `release/CTL5`, the Intent `release/I30`, the settings of the workflow source and the ruleset source.
2. Add the Cases T730 to T735, all RED: the control test (T730, beside the control), the Intent's answer (T731, beside the Intent), the workflow settings (T732), the promoting ruleset source (T733), the unchanged other rulesets and the table of controls (T734), and the fail-closed behavior for an analysis that cannot be made (T735).
3. Observe the expected RED (`evidence.md`), and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN changes no workflow, no ruleset source, no control item and no Intent item, and nothing under `.github`.

## Ids

Allocated by the coordinator on 17 Nov 2026: Change `release/C56`, Cases T730 to T739 (six used), Intent `release/I30`, control `release/CTL5`. The gap `release/G85` is the next free in release.

## Design

- **Settings stated, not inherited.** Both jobs of `analyze-vulnerabilities.yml` carry `fail-on-severity: low` and `fail-on-scopes: runtime`, and neither carries `allow-ghsas`: no advisory is exempted.
- **Integrating stays detective.** Its job carries `warn-only: true` on the action and `continue-on-error: true` on the interpreting step, so a finding is shown in the log and the annotations, and the job does not fail. No ruleset requires it.
- **Promoting fails.** Its job has neither, so a finding fails it.
- **The gate is one more required check.** `promoting.json` requires `verify Stages (Promoting)` and `analyze Vulnerabilities (Promoting)`, both from the same GitHub Actions integration, in this order. No other ruleset source changes. `controls.md` lists the second check against `release/CTL5` and keeps Integrating in the detective table.
- **A control of its own.** The check stays a detection (CTL2); requiring it is a second control that uses the first (CTL5, preventive, Intent I30).

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change:

1. Change the workflow source and `promoting.json` as in `interface.md`, and `controls.md` for the new row.
2. Add `04-controls/CTL5-gate-analyze-vulnerabilities/CTL5.md` and `01-intent/I30-no-vulnerable-promotion/I30.md`, equal to the drafts.
3. Amend the judge of verify Stages so that Promoting may require the check named in `also` of its stage in `stages.json` (`05-src/stages/judge.mjs`, `stages.json`), and the Cases that pin Promoting to its own check only: release/T481, T482, T483, T485 (C35), T513, T516 (C37) and T581 (C48, which says that a ruleset requiring a detective report is a separate control, now this one). Rename T730 to T735 from `.red.mjs` to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Left open

- Loading the ruleset: the Owner, by the ruleset update procedure, after an explicit go. Until then CTL5 states a requirement of the source and claims no live operation.
- Installing the changed workflow: a WIRE, by the Owner's decision. The Promoting check must exist in the repository before the ruleset requires it.
- The legacy `Dependency Review` workflow stays until the equivalence of CTL2 is shown.
- Whether `Integrating` should also be required later: a separate decision.
