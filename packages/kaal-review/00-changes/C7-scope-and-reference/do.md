# review/C7 DO

Authorized by the CPO's approval of the PLAN (#2673), and by the Owner's rule that a merged PLAN is the go for its DO.

## Delivered

- `skills/kaal-review/scripts/navigate.mjs` reads `against` beside `validates`. An item gains `scope` and `against`; the answer gains `judgedAgainst`. An item with no reference or no criteria is `item-incomplete` with a `missing` list. `bad-scope-reference`, `bad-against-reference` and `criterion-restates-reference` are new findings. `about` finds a file from the items that name a folder above it, and the new export `judging` and the command option `--against` find the items judged against a reference.
- `skills/kaal-review/references/review-items.md` names scope, reference (including `intrinsic`) and criteria, and says which are judgement and which the script checks. It names no station and no KAAL term.
- `test/scope-reference.test.mjs` runs the three Cases (review/T1554 to review/T1556) in `scripts.test` with unit tests of `judging` and the command. The temporary `run-red.mjs` is removed.
- Migration: the two example items gain `against: [intrinsic]`, and the fixtures of the existing tests and of the standalone scenario gain an `against`. A2 lists the new findings.

## Not done

T1554 to T1556 stay provisional until release confirms the ids. The joined view of Testing and Review, the subject registry and standing questions per kind of reference are later Changes. No promotion and no publication.
