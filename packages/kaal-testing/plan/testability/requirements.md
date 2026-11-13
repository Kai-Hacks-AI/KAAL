# Testability Assessment: Requirements

Each Requirement names, in brackets, the Intent it serves.

## Functional

- **testing/F129** [testing/I38]: **Three outcomes, in order.** The Testing Skill has one section, placed before "The three loops", that tells an agent to trace a claim to its owner and then decide, in this order: **deterministic** (an observable and an oracle that two readers would accept), **judgment** (evidence, comparison or independent review, named with who judges), **pushback** (the owning concern named, with the question). It names the four owners Intent, Requirements, Architecture and Defect.
- **testing/F130** [testing/I38]: **No invented oracle, no rewriting.** The section forbids inventing an oracle, a threshold or an answer key to obtain GREEN. It makes pushback a recommendation to the owner: Testing does not rewrite a claim. It records a judgment outcome as validation, never as a passing test, and an unclear claim as unknown, using the existing finding kinds.
- **testing/F131** [testing/I38]: **A trial of the installed section.** Judgment is shown by a trial, not by Cases alone. The three contrasting claims (a deterministic one, a judgment one, a pushback one) are given to agents with and without the installed section, at least two runs per arm. Each run records the approach, why, any unresolved question, and the owner and question for a pushback. Each record is a fresh agent's raw output, kept unedited, with its prompt hash. The Skill arm's prompt contains the installed section verbatim, and the baseline's does not.
- **testing/F132** [testing/I38]: **Disagreement is kept, not resolved.** The trial keeps the author's key, with its stated doubts, as one position. Every difference between the key and an answer, between arms and between runs is listed with each position. A difference is never settled by editing the key, the Skill or an answer. A change to the key after a run is recorded with its reason and who made it. The trial states what it cannot show.

## Nonfunctional

- **testing/N27** [testing/I38]: **Boundary.** The Change adds no export to kaal-testing, no Skill, no workflow or ruleset, no Node in `capability/` or `payload/`, and adds no new finding kind. It changes `skills/kaal-testing/SKILL.md` by the one section, and nothing else of the delivered package except the evidence under `plan/`.
