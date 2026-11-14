# Pull Promotion: name the qualifier of highest value density as next (Change A to B)

This is `pull/C9`, a PLAN Change. It ships no code. It carries out the Owner's decision of 14 Nov 2026 on the order of the collectors: "next should be the highest value; ideally deterministic; if not possible, judged". It changes only which qualifier the report names as `next`, and `next` stays advisory: naming it authorizes, recommends and promotes nothing. It authorizes preparation, not promotion or publication.

## A: the present

The report names as `next` the first qualifier in the order in which `declaration.json` lists the collectors. That order is the order the collectors were created in. It says nothing about value, so with two qualifiers the report would name whichever was declared first.

## B: the target

A declared collector may carry three fields, recorded in the declaration:

- `value`, a positive integer: what it is worth to have this collector promoted. It is the **Owner's** decision, recorded in the declaration; the CPO advises and challenges it and reviews the recorded declaration, and does not assign it. It is a judgement, not a measurement.
- `size`, a positive integer: how big the collector is, counted.
- `unit`, a non-empty text: the size unit **and** counting method (for example `IFPUG FP 4.3`, `COSMIC CFP`, or `Cases added`). Function point analysis measures functional size, not value, so it can only feed `size`.

The rank is the **value density** `value ÷ size`, compared exactly by cross-multiplication of integers, never as floats. This is a value-density heuristic, not WSJF: it would only be WSJF if the Owner's `value` itself included the cost-of-delay components, which this Change does not assume.

The report names `next` like this:

- one qualifier: that one, as today, whether it carries the fields or not;
- several qualifiers, each with a valid `value`, a valid `size` and the same `unit`, and one strictly highest density: that one (deterministic: the same declaration and facts always give the same `next`);
- anything else, which is judged: a tie for the highest density, a qualifier with a missing or invalid `value`, `size` or `unit`, or qualifiers whose `unit` differ. No collector is named; the report says `next` is **judged**, lists the candidates and says why. The Script never picks silently, and a missing `size` is never defaulted.

Qualification, `missing` and `qualifiers` do not change. See [requirements.md](requirements.md) and [testing.md](testing.md).

## Not in this Change

No weakening of any rule: scoped PLAN and DO, the exact-head CHECK, Case completeness and exactly one concluding collector-level ACT stay as approved. No value, size or unit is assigned to any collector, and the declaration is not edited. No hook, CI, ruleset or Guard change.

## Order

PLAN (this), then DO (the rule in the Script, the fields in the README and the T38 and T39 Cases moved to green), then ACT, then a concluding collector-level ACT, then SYNC and PROMOTION. Collector: `kaal/release/pull-next`, from `main`.
