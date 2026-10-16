---
name: Slack Transport
type:
  name: Transport
  id: 90f37efd251ca9f6bc559a2deb8fe7ae30bae5aac8fb4379e102166029463f01
---

# Slack Transport

How Slack realizes the Transport contract.

- **Conversation**: a channel or direct message holds conversations. A top-level message starts one, and its thread holds the rest. A reply is posted in the thread of the message it answers.
- **Addressing**: a message opens with its declared author's display marker, an arrow, and the display markers or names of its recipients. A display marker notifies no one; a mention of a Slack account does.
- **Authorship**: the display marker that opens a message declares its author. The Slack account shown as the poster is the posting account. A marker can be posted from any account, so it declares authorship and never proves it. A message without a marker is declared by the person who owns the posting account.
- **Reading**: the Agent reads the channel's history, and the thread it is replying in, from the last message it knows of.
- **Provenance**: a message is referenced by its permalink, which names its workspace, channel and timestamp. A permalink names the message, not its content: a message can be edited or deleted after it was read.
- **Limits**: Slack takes no idempotency key for a send. A send retried after an uncertain failure can post twice. Reading the thread before retrying reduces that risk and does not remove it.
