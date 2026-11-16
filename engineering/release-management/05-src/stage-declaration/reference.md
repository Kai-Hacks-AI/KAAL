# Release stages

A release process is an ordered pipeline of Stages.

- A **Stage** is a step the Subject passes on its way to release.
- A **Subject** is what moves through a Stage: a change set, a collector or an artifact.
- A **gate** is a logical check identity a Subject must pass to enter or leave a Stage.
- **Evidence** is what a gate judges, with a verdict of PASS, FAIL or UNKNOWN. UNKNOWN never passes.
- The **authority** of a Stage says who may pass it.
- The **transition** says how the Subject leaves the Stage, and the **destination** says where it then stands, both by logical name.
- A **part** is an alternate incoming path into a Stage. It is not a Stage and not a predecessor, and it passes the same gates.
- A **binding** realizes a declared pipeline on a platform and holds all platform data. It reads the declaration and adds no Stage and changes no gate.

A consumer declares and configures its Stages in `.kaal/config/release/`, one file per Stage. A sound declaration is not an authorization and not readiness. Scope completeness, product verification and publication readiness are separate gates.
