---
name: Channel
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Channel

A Channel is a medium through which Communication carries content in context. Context establishes what content is relevant to; the Channel is only the medium. A location within a Channel, such as a thread or a pull request, holds one conversation. A Node typed by Channel is one system's realization of Communication, and states how the system provides each of the following:

- **Location**: what in the system holds a conversation, and how a reply joins the conversation of the message it answers.
- **Addressing**: how a message names its recipients.
- **Authorship**: how a message declares its author, and how the account that posted it is observed. The two stay distinct.
- **Reading**: how an Agent reads a conversation before writing into it.
- **Reference**: how a message is pointed to from within the system, for example from another location. A reference may stop resolving. A Change never references a conversation.
- **Limits**: what the system does not guarantee, including whether a retried send can deliver a message twice.

A Channel holds no KAAL state and grants nothing. What it delivers is information for its recipients, never permission. Where content is about a Change, the Channel carries it; the Change and its facts remain Change's.
