# Controls as a Capability: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **controls/N1** [controls/I1]: The Definitions other capabilities document their controls with keep their identity. The bytes of `Control`, `Realized by`, `VARISC` and `HAPTIC`, and so their ids, do not change. A Control Node a consumer writes against them stays admitted and resolved.
- **controls/N2** [controls/I1]: Controls cites Testing by name in its text, as Change does. It takes no runtime dependency, adds no Graph Edge to Testing and copies none of Testing's text.

## Functional

- **controls/F1** [controls/I1]: The Node `Controls` is typed by Core's `KAAL Capability`. Core admits it with `register(dir, "capability", "kaal-controls", …)`, and `catalog(dir).capabilities` lists it, not `skills`. `ownership.kaal.json` names it by kind `capability` and its new id. The Agent Skill `skills/kaal-controls/SKILL.md` stays Controls' Agent Skill, and the README's registration line follows the kind.
- **controls/F2** [controls/I1]: Controls' Node, Agent Skill and README define none of the following, and each names Testing where a claim about a control depends on it:
  - verification and validation;
  - that a clean result is never a claim of complete correctness;
  - that what lies outside the checks and judgments performed stays unknown.

  Applied to a control, they read as a detective control reporting nothing gives a clean result in Testing's sense, and a fact about a control that was not observed is unknown in Testing's sense.
- **controls/F3** [controls/I1]: Controls keeps the evidence and effectiveness semantics that are its own, unchanged in meaning:
  - type is design, distinct from assurance;
  - documented is not enforced, configured is not operating, and operating once is not effective;
  - a preventive claim names the action, the actor or interface, and the enforcement boundary, and never promises that the action is impossible;
  - controls a gate combines stay independent, and a sign-off is not a type of control;
  - a `Realized by` Edge is traceability, never evidence.
