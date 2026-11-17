# C70 change

## PLAN

1. Add the draft in `interface.md`: the `alsoRules` declaration of a stage and what the judge does with it.
2. Add the Cases T900 and T901, both RED: a declared extra rule with its parameters is accepted (T900), and a missing, an undeclared, a differently parametrized, an additional or a reordered rule, an unreadable declaration and the rule on a part each fails (T901).
3. Observe the expected RED and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN changes no judge, no declaration and nothing under `.github`.

## Ids

Allocated by the coordinator on 17 Nov 2026: Change `release/C70`, Cases T900 to T909 (two used). No gap id.

## DO

On the merged PLAN, into the collector of this Change:

1. In `05-src/stages/judge.mjs`, the rules expected of a branch ruleset are `required_status_checks`, then `alsoRules` of its stage when `stages.json` declares one, with their parameters. The draft is three lines of the judge.
2. Rename T900 and T901 from `.red.mjs` to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Left open

The first stage to declare `alsoRules` is Integrating, by release/C66 (the approval rule of release/CTL10). It lands after this Change is on main. Until then no stage declares one and the judge's verdict on the real sources is unchanged.
