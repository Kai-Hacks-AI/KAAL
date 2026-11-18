---
name: INFORMED
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# INFORMED

Implementation Navigates Forward: Observed Results Mirror Earlier Decisions.

INFORMED names the tracing chain of the [KAAL object metamodel](metamodel.md): Intent, Requirement, Architecture, Control, Test Case, and then the code or ruleset the Test Case runs. The chain is an anchor for semantic reasoning, both when a Change is created and when it is understood afterwards.

- **Implementation** is the code, workflow or ruleset that a Test Case runs: the Source of the model.
- **Navigates Forward** says that work moves along the chain from the decisions toward the Implementation. A reader goes the other way with the same links, to ask what an object refines, satisfies or verifies and what refines, satisfies or verifies it.
- **Observed Results** are what a Test Case or a check reports when it runs: RED, GREEN, or UNKNOWN. UNKNOWN never passes.
- **Mirror** says that each observed result reflects a decision, and each decision has a result that reflects it. A result no decision explains, or a decision no result can show, is a gap in the chain.
- **Earlier Decisions** are the Intent, the Requirements, the Architecture and the Controls, which are decided before the Test Case and the Implementation.

INFORMED names how the chain is read. It is a mnemonic, not a procedure: it owns no instruction, no capability and no control, prescribes no step for a type of work, and does not say how a link is written in a file. The links are defined once, in the metamodel.

## In a pull request

Each PR template carries an INFORMED chapter: a link to its metamodel view, the Change, and one tickbox per concern that the view expects. A box is ticked, or n/a with a reason; a tick is the author's claim, not evidence. The chapter is checked as process (it is complete) and, separately, as content (the claims match the evidence, in both directions).

## Resolution

A reference to this Definition is the path `engineering/metamodel/INFORMED.md`.
