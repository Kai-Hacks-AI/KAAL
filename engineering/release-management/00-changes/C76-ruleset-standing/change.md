# C76 change

## PLAN

1. Add the drafts in `interface.md` (Intent, control, Requirement, Architecture, the stage declaration and what the judge does with it) and the Cases T972 to T974, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN changes no judge, no declaration, no ruleset source and nothing under `.github`.

## Mechanism

The settings are answered by one control, release/CTL13, that has one Intent, release/I41. The Requirement release/F58 states the settings; the Architecture release/A53 states where the declaration and the judge hold them. T972 to T974 cover each setting; the ruleset source is the code.

## Order with the other settings Changes

release/C76 (standing), release/C77 (check policy) and release/C78 (tag) each change `judge.mjs` and `stages.json`. They are planned in parallel and delivered one after the other, each as a collector from `main` once the one before it is promoted, so that their DOs do not collide. `verify Stages` runs `main`'s judge on a PROMOTION: the keys added here are ignored by the judge on `main`, so the PROMOTION passes (the pattern of release/C59 and release/C70).

## Ids

Change `release/C76`, control `release/CTL13`, Intent `release/I41`, Requirement `release/F58`, Architecture `release/A53`, Gap `release/G99`, Cases T972 to T981 (three used), reserved by the release thread on 18 Nov 2026.

## DO

Not authorized by this PLAN. On the merged PLAN, into the collector of this Change: add `I41.md`, `CTL13.md`, `F58.md` and `A53.md` equal to the drafts, the declaration in `stages.json` and the interpretation in `judge.mjs`; amend the Cases that build the judge's facts if they must hold the new keys; rename T972 to T974 from `.red.mjs` to `.test.mjs` when green. The control carries a `status` line once release/C62 is on `main` (it is).

## ACT

A 4L retrospective in `act.md`.

## Left open

- Whether the live rulesets hold these values is the Owner's loading, not this Change. DIRT on `main` is Implemented only.
- The other untraced settings and the other groups are the other two Changes of this set.
