---
name: Change Lifecycle
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Change Lifecycle

A Change's state is read from facts its realization already keeps; Change stores no state of its own. It has four states.

A Change is Proposed while it is open against its collector. Its record number is provisional.

A Change is Accepted once it merges into its collector. Its record number is consumed, and it never leaves this state: undoing it is a new Change.

A Change is Withdrawn when it closes without merging. It consumes no record number, and reopening it makes it Proposed again.

A Change is Promoted once the collector's work that contains it reaches main. Only an Accepted Change can be Promoted.

Approval, verification and validation are not states. Approval and validation are Review's judgments and verification is Testing's evidence; Change tracks their status and references them. Being Accepted or Promoted does not prove that the Intent a Change realizes achieved its Outcome.
