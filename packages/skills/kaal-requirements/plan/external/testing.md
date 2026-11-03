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

## Planned tests and RED evidence (`requirements/C16`)

The planned tests are `packages/skills/kaal-requirements/test/plan/external.test.mjs`, written in `requirements/C16` and turned GREEN by `requirements/C17`. They are immutable to DO and CHECK. They run with `npm run build -w kaal-hosting -w kaal-core && node --test packages/skills/kaal-requirements/test/plan/external.test.mjs`, outside the package's `npm test` until `requirements/C17`, so the collector's lanes stay green.

| Test | Checks | Recorded |
| --- | --- | --- |
| requirements/T27 | Skill present, provided by the contract as a directory asset into `.agents/skills/kaal-requirements`, catalogued, packed, listed in `files` | RED, **blocked before behavioural assertion**: `skills/kaal-requirements/SKILL.md` does not exist |
| requirements/T28 | No `kaal` command or install instruction, and no Engine as a precondition. An explicit independence statement or an optional reference to the Nodes may mention an Engine | RED, blocked before behavioural assertion: no Skill |
| requirements/T29 | The Skill's what-it-is statements, including the definition sentence (one condition, held by the responsible business context, verifiable by test or other evidence), are present verbatim in the Node `Requirement` | RED, blocked before behavioural assertion: no Skill |
| requirements/T30 | Plain form: `<capability>/F<n>` or `N<n>`, condition, Intent where known, same meaning as a Node, no id required | RED, blocked before behavioural assertion: no Skill |
| requirements/T31 | A check for "verifiable" naming an observable result, with Testing as the judge | RED, blocked before behavioural assertion: no Skill |
| requirements/T32 | Effects: text returned to the requester by default, a repository file only where the requester has said Requirements are kept, no "any file", and that it authorizes nothing | RED, blocked before behavioural assertion: no Skill |

All six are RED, and none yet exercises its behavioural assertion. The logic of T28 to T32 was checked against throwaway Skills, which were then removed: a compliant one (with an independence statement and an optional Node reference) passes T28 to T32 and only T27, which needs the contract, stays RED, and "Read the Node in a KAAL Engine first" fails T28. The External trial row above is not a test here, so "stands alone" remains **untested**.

Fixed by the tests for the DO: the Skill is `skills/kaal-requirements/SKILL.md` with `## Plain form` and `## Effects` sections, and the contract asset follows Guard's shape (`kind: directory`, `provides: [{ "skill": "kaal-requirements" }]`).
