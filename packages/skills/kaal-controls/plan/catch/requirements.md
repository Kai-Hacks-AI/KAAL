# CATCH ME IF YOU CAN: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **controls/N3** [controls/I2]: The principle adds no registry, no list of hunts and no package dependency, and Controls executes nothing. It is a Definition that Core admits like `HAPTIC`. The ids of `Control`, `Realized by`, `VARISC` and `HAPTIC` stay unchanged (`controls/N1`).

## Functional

- **controls/F4** [controls/I2]: `CATCH ME IF YOU CAN` is a Node typed by Core's `KAAL Definition` in Controls' payload. It keeps the Owner's expansion verbatim, "Control Agents Through Continuous Hunting Misbehaving Elements, Implementing Fierce Yet Objective Unbiased Checks Against Noncompliance.", whose initials spell the name.
- **controls/F5** [controls/I2] **Hunting.** The elements hunted are any part of the work and its contracts: requirements, architecture, tests, evidence, configurations and behaviour, not only Agents. A GREEN result, a passing review or artifacts that agree with each other are where the hunt starts, not where it ends. In Controls' terms, a hunt is a detective control: it reveals, and it blocks nothing.
Each capability argues from its own seat. controls/F6–controls/F8 state Controls' principle in Controls' own terms, and use no other capability's semantics.

- **controls/F6** [controls/I2] **Objectivity.** A suspicion is not a proven defect, and a hunt claims no more than its evidence supports.
  - A suspicion is stated as a suspicion until evidence decides it.
  - Discriminating evidence comes first: a check whose result would differ depending on whether the suspicion holds.
  - A claim that no check can decide stays undecided until a judgment decides it, and is never presented as decided.
  - A suspicion the evidence refutes is reported as refuted.
  - A hunt that finds nothing shows only that it found nothing within what it examined, never that nothing is there.
- **controls/F6a** [controls/I2] **Self-checking and independent assurance.** Anyone may hunt, including whoever produced the work. Hunting one's own work is self-checking, and it is encouraged. Only a claim of independent assurance requires that whoever hunted did not produce the work, as Controls already requires for combined controls. A self-check is reported as one, never as independent assurance, and no hunt is required to be independent.
- **controls/F7** [controls/I2] **Both sides.** Where two elements are checked against each other, such as a test and its implementation, a requirement and its test, or a check and the configuration it reads, each side is also challenged against the contract it answers to, not only against the other side. That prevents the two from being tuned to each other, which leaves brittle tests and mutual overoptimization.
- **controls/F8** [controls/I2] **Boundary.** Controls owns only this principle, together with control independence and the limits of assurance it already owns.
  - It defines no finding taxonomy, nothing about Defects or how they trace, no review judgment, and nothing about how Agents operate, check execution or gating.
  - Where a consumer has them, other capabilities' existing contracts complement a hunt, such as Testing's findings or Review's validation. The Definition may name them as optional complements, by name, without assuming they are present and without repeating their semantics.
  - Which elements a capability hunts, and when, is that capability's decision.
- **controls/F9** [controls/I2]: Controls' Agent Skill gains a short section, "Hunt for misbehaving elements", that applies controls/F5–controls/F7, including controls/F6a, and points to the Node.
