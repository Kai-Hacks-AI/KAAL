# Reject-a-Case Enforcement: Requirements

Each Requirement names, in brackets, the Intent it serves.

## Functional

- **testing/F134** [testing/I39]: **The field is enforced.** In the trial's records, each claim of the key states whether it is a proposed Case (`isCase`). An answer to a Case claim carries `rejectsCase` as true or false. An answer to any other claim carries it as null. A missing field, a non-boolean on a Case claim, or a value on a non-Case claim is a problem with that answer.
- **testing/F135** [testing/I39]: **A real Case, and enough of each.** The key has at least two Case claims and two other claims. At least one Case claim names, in `source`, a Case file that exists in the repository and is not a Case of this Change. The trial has at least two runs per arm, and each record is a fresh agent's raw output with its prompt hash, as in `testing/F131`. The Skill arm's prompt contains the section as installed, and the baseline's does not.
- **testing/F136** [testing/I39]: **Disagreement is kept, not resolved.** The key gives for each Case claim the author's expectation of `rejectsCase`, with a stated doubt. The comparison lists, for each Case claim, the key and each run's value. Every difference between the key and an answer, and between arms, is listed unresolved. A difference is never settled by editing the key, the Skill or an answer. The comparison states what the trial cannot show.

## Nonfunctional

- **testing/N29** [testing/I39]: **Boundary.** The Change adds no export, Node, Skill, workflow, ruleset, dependency or finding kind, and does not edit `skills/kaal-testing/SKILL.md`, `testing/T156` to `T160` or `plan/testability/`. `testing/T160` stays GREEN. Its Cases read the repository only, and check shape and integrity, never a sentence of the Skill and never that an answer is the right one.
