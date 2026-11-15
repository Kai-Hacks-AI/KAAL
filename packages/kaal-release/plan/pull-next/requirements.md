# Pull Promotion: next is the qualifier of highest value density; otherwise it is judged (target)

Scoped `pull/` (ids are global). Nothing of pull/F25 to F37 is relaxed. `next` is advisory: it never authorizes, recommends or performs a promotion.

- **pull/F38. `next` is the qualifier of highest value density when that is determinable; a tie or an incomparable or missing input is judged, never picked or defaulted.**
  - A collector in the declaration may carry `value` and `size`, both positive integers, and `unit`, a non-empty text naming the size unit and counting method. Its density is `value ÷ size`, compared exactly (cross-multiplication of integers), never as floats.
  - `value` is a judgement owned by the Owner and recorded in the declaration; the CPO advises and challenges and reviews the recorded declaration. `size` is a count; function point analysis (IFPUG, COSMIC) can inform it but does not measure value. This is a value-density heuristic, not WSJF, unless the Owner's `value` itself includes the cost-of-delay components.
  - With no qualifier, `next` is unchanged. With exactly one qualifier, `next` names it, whether it carries the fields or not.
  - With several qualifiers, `next` names one only when every qualifier has a valid `value`, a valid `size` and the same `unit`, and one density is strictly highest. The result depends only on the declaration and the facts, never on the order in which the collectors are listed.
  - Otherwise `next` names no collector (`collector: null`), carries `judged: [names]` (the tied top candidates when everything is comparable, else all qualifiers) and a reason that says the choice is judged by the Owner and why (a tie, a missing or invalid field, or different units). A missing `size` or `unit` is never defaulted. A present but invalid field (not a positive integer, or an empty `unit`) is also named in `problems`.
  - `collectors`, their statuses and `missing`, `qualifiers`, `undeclared` and the rest of the report do not change.
