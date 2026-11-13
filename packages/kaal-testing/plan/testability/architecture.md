# Testability Assessment: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A38** [testing/F129, testing/F130, testing/N27]: One section, "Assessing a test against its claim", in `skills/kaal-testing/SKILL.md`, between "Before writing a test" and "The three loops". Its proposed wording is `proposed-skill-section.md`, about 190 words. It points at the findings already defined in `references/findings.md`: deterministic results are verified failures or clean results, judgments are validation, an untestable claim is an unknown. `references/findings.md` does not change.

## What owns what

| Concern | Owns |
| --- | --- |
| Intent, Requirements, Architecture, Defect | their claims and what they mean |
| Review | judgement, and pointing at what could be tested. That is Review's own Change. Testing and Review each point across the line without naming, depending on or calling the other's Skill |
| Testing, by the Skill | the assessment of testability, the suitability of a method, and the recommendation to a concern owner |
| Testing, by the Script | only deterministic properties, here: the shape and integrity of the trial records (testing/T158, T159) and the boundary (testing/T160). It judges no semantic correctness |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C59` PLAN, this Change | Testing | none |
| `testing/C60` DO: the section in the Skill, the trial under `plan/testability/trial/do/`, testing/T156 to T160 GREEN | Testing | `testing/C59` |
| Architecture's decision on T3 and its key | Architecture | independent of this Change |
