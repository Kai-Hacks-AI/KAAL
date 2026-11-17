# C59 change

## PLAN

1. Add the draft in `interface.md`: the `also` list of a stage and what the judge does with it.
2. Add the Cases T760 and T761, both RED: a declared extra check is accepted (T760), and a missing, an undeclared, a reordered or an unlisted-by-declaration extra check each fails (T761).
3. Observe the expected RED and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN changes no judge, no declaration and nothing under `.github`.

## Ids

Allocated by the coordinator on 17 Nov 2026: Change `release/C59`, Cases T760 to T769 (two used), gap `release/G88`.

## DO

On the merged PLAN, into the collector of this Change:

1. In `05-src/stages/judge.mjs`, the checks expected of a branch ruleset are its own, then `also` of its stage when `stages.json` declares one.
2. Rename T760 and T761 from `.red.mjs` to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Left open

The first stage to declare `also` is `Promoting`, by release/C56. That Change lands after this one is on main.
