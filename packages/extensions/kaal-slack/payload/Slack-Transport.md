---
name: Slack Transport
type:
  name: Transport
  id: 80933d0c307b88d2d83cbfafb167dd125e474d9d67d4199c1b1129ed2e62a386
---

# Slack Transport

How Slack realizes the Transport contract.

- **Conversation**: a channel or direct message holds conversations. A top-level message starts one, and its thread holds the rest. A reply is posted in the thread of the message it answers. The thread's latest replies are its coordination context: a handoff is a reply addressed to the next participant, and a concluding reply ends it. A reaction is a mark on the one message it is on, recording an event about the request in it: 👀 `eyes` seen, a participant's display marker taken by that participant, ✅ `white_check_mark` done and ⛔ `no_entry` blocked. Reactions are added, never removed, and never carry the state of a thread or who acts next. A reaction's emoji names the participant or event it records; the account that added it is a separate fact.
- **Addressing**: a message opens with its declared author's display marker, an arrow, and the display markers or names of its recipients. A display marker notifies no one; a mention of a Slack account does.
- **Authorship**: the display marker that opens a message declares its author. The Slack account shown as the poster is the posting account. A marker can be posted from any account, so it declares authorship and never proves it. A message without a marker is declared by the person who owns the posting account.
- **Reading**: the Agent reads the channel's history, and the thread it is replying in, from the last message it knows of.
- **Reference**: a message's permalink, which names its workspace, channel and timestamp. A Change may link one as optional context. Messages can be edited, deleted or expire, so a permalink is never required evidence.
- **Limits**: Slack takes no idempotency key for a send. A send retried after an uncertain failure can post twice. Reading the thread before retrying reduces that risk and does not remove it.
