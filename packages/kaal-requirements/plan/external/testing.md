# Requirements stands alone (External use): Testing

This PLAN adds no Case and changes none. `npm test -w kaal-requirements` is unchanged. The tests Change that follows plans and first observes RED each of these, and they are immutable to the DO:

| Planned check | Observes | Deliberately wrong state that makes it RED |
| --- | --- | --- |
| Skill present and provided | `skills/kaal-requirements/SKILL.md` exists, `contract.json` names it in `provides`, and the packed package holds it | Today's package, which has no Skill |
| No Engine precondition | The Skill contains no instruction to read an Engine, run a `kaal` command or install a package as a precondition of stating a Requirement | A Skill that opens with "read the Node in a KAAL Engine" |
| Meaning matches the Node | Each statement of what a Requirement is and is not in the Skill is present in `Requirement.md` | A Skill that says a Requirement includes how it is built |
| Plain form is valid | The plain form has capability, kind and number, condition, and optional Intent, and no Node id or Definition id | A plain form that requires the Definition id |
| Verifiable test given | The Skill states the check for "verifiable" and names Testing as the judge | A Skill silent on verifiability |
| Effects declared | The Skill states what it writes and where | A Skill silent on writing |
| External trial | A fresh agent given only the Skill text states a Requirement from a realistic prompt in an unrelated repository, and the result meets the Skill's own rules | Not run here. Recorded by Testing's External scenario (portfolio view option 3) and reported as untested until it exists |

None is written or run here. Verification of this Change is review against the evidence in `intent.md` plus the required checks. "Stands alone" is untested until the trial exists, and no document may claim otherwise.
