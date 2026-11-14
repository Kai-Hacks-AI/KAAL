# Pull Promotion: name the highest-value qualifier as next (Change A to B)

This is `pull/C9`, a PLAN Change. It ships no code. It carries out the Owner's decision of 14 Nov 2026 on the order of the collectors: "next should be the highest value; ideally deterministic; if not possible, judged". It changes only which qualifier the report names as `next`. It authorizes preparation, not promotion or publication.

## A: the present

The report names as `next` the first qualifier in the order in which `declaration.json` lists the collectors. That order is the order the collectors were created in. It says nothing about value, so with two qualifiers the report would name whichever was declared first.

## B: the target

A declared collector may carry a `value` and a `size`, both positive integers set in the declaration. `value` is the judged part: what it is worth to have this collector promoted sooner (a cost of delay), set by the Owner or the CPO. `size` is the counted part: how big the collector is, in one unit used for all collectors (a function point or COSMIC count, or the number of Cases it adds); when absent it is 1, so `value` alone is the rank. The rank is `value ÷ size` (value per unit of size, as in WSJF), compared exactly by cross-multiplication, never as a float. The report then names `next` like this:

- one qualifier: that one, as today;
- several qualifiers, each with a valid rank, and one strictly highest: that one (deterministic: the same declaration and facts always give the same `next`);
- several qualifiers with the highest rank tied, or any qualifier without a valid `value` (or with an invalid `size`): no collector is named. The report says `next` is **judged**, lists the candidates, and the CPO or Owner picks. The Script never picks silently.

Qualification, `missing` and `qualifiers` do not change. The `value` is a judgement made once and reviewed like any other line of the declaration; `size` is a count; the Script only reads both and does the arithmetic. Function point analysis measures size, not value, so it feeds `size` and never replaces the judged `value`. See [requirements.md](requirements.md) and [testing.md](testing.md).

## Not in this Change

No weakening of any rule: scoped PLAN and DO, the exact-head CHECK, Case completeness and exactly one concluding collector-level ACT stay as approved. The report stays advisory: naming a `next` promotes nothing. No value or size is assigned to any collector in this Change, and the declaration is not edited. No hook, CI, ruleset or Guard change.

## Order

PLAN (this), then DO (the rule in the Script, the field in the README and the T38 and T39 Cases moved to green), then ACT, then a concluding collector-level ACT, then SYNC and PROMOTION. Collector: `kaal/release/pull-next`, from `main`.
