# Pull Promotion: the highest-value qualifier is next (target)

Scoped `pull/` (ids are global). Nothing of pull/F25 to F37 is relaxed.

- **pull/F38. `next` is the highest-value qualifier; a tie or a missing value is judged, never picked.**
  - A collector in the declaration may carry `value` (a judged cost of delay, higher is worth more) and `size` (a counted size in one unit for all collectors), both positive integers. Its rank is `value ÷ size`; an absent `size` is 1. A `value` that is absent or not a positive integer, or a `size` that is present and not a positive integer, gives the collector no valid rank, and a present but invalid field is also named in `problems`. Ranks are compared exactly (cross-multiplication of integers), never as floats.
  - With no qualifier, `next` is unchanged. With exactly one qualifier, `next` names it, whether it carries a value or not.
  - With several qualifiers, every one with a valid rank and one strictly highest, `next` names that one. The result depends only on the declaration and the facts, never on the order in which the collectors are listed.
  - With several qualifiers where the highest rank is tied, or any of them has no valid rank, `next` names no collector (`collector: null`), carries `judged: [names]` (the tied top candidates, or all qualifiers when a rank is missing) and a reason saying the choice is judged by the CPO or the Owner.
  - `collectors`, their statuses and `missing`, `qualifiers`, `undeclared` and the rest of the report do not change.
