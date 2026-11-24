# Worked examples from controls/C21

Two of the five judgments of controls/C21 (`judgments.md`, J1 and J3, in PR #2319) written in the shape this PLAN defines, with the four appraisals that were made of them. They show the contracts at work. They are history, not new executions: each result names its source and the PR review it comes from, the words are taken from those reviews, and the only thing this PLAN adds is the mapping of each stated disposition into the three conclusions (`mapped-by` says so). The originals stay where they are; nothing in controls changes.

| Example | From | Subject revisions |
| --- | --- | --- |
| `items/V1.md` | J1, the protected property | controls I15 and F34 |
| `items/V2.md` | J3, responsibility placement | controls A20, F34 and `interface.md` |
| `records/RV1.md` | the appraisal at `68230a6f` of J1 | satisfied |
| `records/RV2.md` | the appraisal at `36766a0f` of J1, carried | satisfied, carried from RV1 |
| `records/RV3.md` | the appraisal at `68230a6f` of J3 | unresolved, with its parts |
| `records/RV4.md` | the appraisal at `36766a0f` of J3, after the targeted trial | satisfied, bounded |

What the examples show. RV3 keeps visible what the original stated in one clause, "satisfied on the documents; not evidenced by the trial": under F29 the part that the documents place every duty is satisfied and the part that an agent applies the split is unresolved, so the whole is `unresolved`, and RV4 closes it with the trial. RV2 is a carry-forward: the property was not touched by the later commit, and the record says why. The CPO's approval of the DO at the second revision is a separate decision that cites these results and is not one of them.

C21 also required each judgment "at CHECK". That is a station, and the items have no field for it; an adapter that wants it keeps it beside the item.
