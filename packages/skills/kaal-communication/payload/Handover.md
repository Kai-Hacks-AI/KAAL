---
name: Handover
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Handover

A Handover passes a piece of work from one participant to another: what is asked, by whom and of whom, with the context needed to do it and the result expected. The recipient acknowledges it, does the work within its own authority, and returns the result, or what blocks it, in the conversation the Handover came from.

A Handover is recorded as a Node typed by Handover, so that a participant in a later session recovers agreed work by its exact content. A record states:

- **From** and **To**: the participants, by their declared identities.
- **Request**: the work and the result expected.
- **Evidence**: the Transport references of the messages the record rests on.
- **Answers**, only on a record that completes another: the name and id of the record it completes, and the outcome.

A record that no other record answers is open. A Handover grants nothing: the recipient's authority is the same after it as before.
