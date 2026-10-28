# Controls as a Capability: Intent

This is `controls/C1`, a PLAN Change and Controls' first Change in FANATIC. It ships no Node, code or test. `controls/C2` realizes it.

Controls predates the capability-first model. A Capability is KAAL's unit of responsibility, ownership and delivery, and Process, Change, Product, Learning and Testing are already typed by Core's `KAAL Capability`. Controls is still typed `KAAL Skill`. Its text also restates semantics that Testing owns: what verification and validation are, that a clean result is not a claim of absence, and that an unobserved fact stays unknown. One responsibility has one owner and any number of consumers, so Controls should consume Testing's definitions rather than keep a second copy.

- **controls/I1**: Controls is a KAAL Capability, and its responsibility overlaps no other Capability's. It owns the semantics of controls: their objective, type, mechanism, evidence of design, configuration, operation and effectiveness, the scope of a preventive claim, the independence of controls that a gate combines, and the `Control` and `Realized by` Definitions. It cites Testing for verification, validation and the meaning of findings and results, and does not restate them.

This Change leaves VARISC and HAPTIC alone. Process owns roles, the assignment of actors to activities and responsibility matrices. Controls owns only the constraints on those assignments, such as segregation of duties, what counts as evidence of sign-off or verification, and the independence a preventive control needs. VARISC is divided between the two by its own Changes after Process is promoted (see [Architecture](architecture.md#change-graph)). Until then it stays where it is, unchanged.
