# C70 change

## PLAN

1. Add the draft in `interface.md`: the `rules` declaration of a stage and what the judge does with it.
2. Add the Cases T900 to T903, all RED: one declared rule passes (T900); two and three declared rules pass, whatever their order (T901); an undeclared rule, a missing rule, a setting that differs or is not declared, and an undeclared or missing check each fail (T902); a trace to no control, to an undeclared control or to a control without an Intent, and an unreadable or missing declaration each fail (T903).
3. Observe the expected RED and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN changes no judge, no declaration and nothing under `.github`.

## Ids

Allocated by the coordinator on 17 Nov 2026: Change `release/C70`, Cases T900 to T909 (four used). No gap id.

## DO

On the merged PLAN, into the collector of this Change:

1. In `05-src/stages/judge.mjs`, replace the code shape of a branch ruleset by the interpretation in `interface.md`; read the controls (`id`, `has`) of the checkout; in `stages.json`, replace `requires` and `also` by `rules` with the controls, settings and checks of today's five rulesets, so the verdict on the real sources does not change.
2. Amend the Cases that read the old keys or build the judge's facts: release/T483, T487, T511, T512, T513, T760 and T761, and the shared helper `00-changes/C35-stages/helper.mjs` (it supplies the controls). T760 and T761 are superseded by T900 to T903.
3. Rename T900 to T903 from `.red.mjs` to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Left open

- **The first new setting** is the approval rule of release/CTL10 in `integrating`, by release/C66, declared in the form above. It lands after this Change is on main.
- **What traces today** (read from the five sources): the checks do. `verify Stages (Integrating)`, `(Developing)`, `(Collecting)`, `(Hotfixing)`, `(Wiring)` and `(Promoting)` trace to release/CTL1 (Intent release/I27), and `analyze Vulnerabilities (Promoting)` to release/CTL5 (release/I30). What does not trace to any control: the ruleset-level settings, `enforcement: active`, the refs of each ruleset, the empty bypass list (judged, but as a fixed expectation, not as the answer to a control), `strict_required_status_checks_policy: false` ("no up to date": a decision, no control states it), `do_not_enforce_on_create` (true on integrating, false on promoting: no control states why), and the Publishing tag rule `update` (the published tag cannot be moved: no control declared). Each needs a control and an Intent, or an explicit decision that it is a ruleset-level expectation; that is a Change of its own, not this one. The rules the old rulesets hold and the new sources do not (`non_fast_forward`, code scanning, deletion, the 14 checks, merge queue) have no declared control either, and enter a new ruleset one at a time with theirs (the Owner's rule: no legacy control in a new ruleset yet).
- **Test Cases per setting.** The judge's Cases cover the interpretation. That each setting holds its value is covered by the control's own Case beside it (release/CTL10's T862 for the approval), and the judge makes a setting without a trace a finding.
