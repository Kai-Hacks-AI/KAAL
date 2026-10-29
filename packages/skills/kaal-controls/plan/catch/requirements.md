# CATCH ME IF YOU CAN: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **controls/N3** [controls/I2]: The principle adds no registry, no list of hunts and no package dependency, and Controls executes nothing. It is a Definition that Core admits like `HAPTIC`. The ids of `Control`, `Realized by`, `VARISC` and `HAPTIC` stay unchanged (`controls/N1`).

## Functional

- **controls/F4** [controls/I2]: `CATCH ME IF YOU CAN` is a Node typed by Core's `KAAL Definition` in Controls' payload. It keeps the Owner's expansion verbatim, "Control Agents Through Continuous Hunting Misbehaving Elements, Implementing Fierce Yet Objective Unbiased Checks Against Noncompliance.", whose initials spell the name.
- **controls/F5** [controls/I2] **Hunting.** The elements hunted are any part of the work and its contracts: requirements, architecture, tests, evidence, configurations and behaviour, not only Agents. A GREEN result, a passing review or artifacts that agree with each other are where the hunt starts, not where it ends. In Controls' terms, a hunt is a detective control: it reveals, and it blocks nothing.
- **controls/F6** [controls/I2] **Objectivity.** A suspicion is not a proven defect. It is reported as an open finding, in the kinds Testing defines, until evidence decides it. Controls names none of those kinds and fixes none of their transitions, so it follows Testing as Testing changes.
  - Discriminating verification comes first: a check whose result would differ depending on whether the suspicion holds.
  - Where verification cannot decide a claim, validation by Review judges it.
  - A suspicion the evidence refutes is reported as refuted.
  - A hunt that finds nothing gives a clean result in Testing's sense, never a claim that nothing is there.
- **controls/F6a** [controls/I2] **Self-checking and independent assurance.** Anyone may hunt, including whoever produced the work: hunting one's own work is self-checking, and it is encouraged. A hunt supports a claim of independent assurance only when whoever hunts is not whoever produced the work, as Controls already requires for combined controls. A self-check is reported as one, never as independent assurance, and no hunt is required to be independent.
- **controls/F7** [controls/I2] **Both sides.** Where two elements are checked against each other, such as a test and its implementation, a requirement and its test, or a check and the configuration it reads, each side is also challenged against the contract it answers to, not only against the other side. That prevents the two from being tuned to each other, which leaves brittle tests and mutual overoptimization.
- **controls/F8** [controls/I2] **Boundary.** Controls owns only the principle. These stay with their owners:
  - The kinds of findings, the meaning of a result, what a Defect is and how Defects and Test Cases trace to each other are Testing's. Controls takes no position on any of them.
  - Review judgments are Review's.
  - How Agents work is that of the capabilities that define them.
  - Executing checks is Guard's.
  - When checks run and what they gate is Engineering's.

  Which elements a capability hunts, and when, is that capability's decision.
- **controls/F9** [controls/I2]: Controls' Agent Skill gains a short section, "Hunt for misbehaving elements", that applies controls/F5–controls/F7, including controls/F6a, and points to the Node.
