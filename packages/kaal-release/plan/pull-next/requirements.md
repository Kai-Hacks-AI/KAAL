# Pull Promotion: the highest-value qualifier is next (target)

Scoped `pull/` (ids are global). Nothing of pull/F25 to F37 is relaxed.

- **pull/F38. `next` is the highest-value qualifier; a tie or a missing value is judged, never picked.**
  - A collector in the declaration may carry `value`: a positive integer (higher is worth more). A `value` that is absent or not a positive integer counts as no value, and a non-integer is also named in `problems`.
  - With no qualifier, `next` is unchanged. With exactly one qualifier, `next` names it, whether it carries a value or not.
  - With several qualifiers, every one with a valid `value` and one strictly highest, `next` names that one. The result depends only on the declaration and the facts, never on the order in which the collectors are listed.
  - With several qualifiers where the highest value is tied, or any of them has no valid value, `next` names no collector (`collector: null`), carries `judged: [names]` (the tied top candidates, or all qualifiers when a value is missing) and a reason saying the choice is judged by the CPO or the Owner.
  - `collectors`, their statuses and `missing`, `qualifiers`, `undeclared` and the rest of the report do not change.
