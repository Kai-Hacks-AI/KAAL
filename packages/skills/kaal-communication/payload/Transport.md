---
name: Transport
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Transport

A Transport carries Communication through one system. A Node typed by Transport is that system's realization of Communication, and states how the system provides each of the following:

- **Conversation**: what holds a conversation, and how a reply joins the conversation of the message it answers.
- **Addressing**: how a message names its recipients.
- **Authorship**: how a message declares its author, and how the account that posted it is observed. The two stay distinct.
- **Reading**: how an Agent reads a conversation before writing into it.
- **Provenance**: the stable reference by which a message is found again. It is the evidence wherever an outcome is recorded; it is never part of a Node's identity.
- **Limits**: what the system does not guarantee, including whether a retried send can deliver a message twice.

A Transport grants nothing. What it delivers is information for its recipients, never permission.
