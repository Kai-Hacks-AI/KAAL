---
name: Slack Transport
type:
  name: Transport
  id: 9ea4679554cfc1ba78441864c6765b9c7582e6b45e9246a8c486e83507917c92
---

# Slack Transport

How Slack realizes the Transport contract.

- **Conversation**: a channel or direct message holds conversations. A top-level message starts one, and its thread holds the rest. A reply is posted in the thread of the message it answers.
- **Addressing**: a message opens with its declared author's display marker, an arrow, and the display markers or names of its recipients. A display marker notifies no one; a mention of a Slack account does.
- **Authorship**: the display marker that opens a message declares its author. The Slack account shown as the poster is the posting account. A marker can be posted from any account, so it declares authorship and never proves it. A message without a marker is declared by the person who owns the posting account.
- **Reading**: the Agent reads the channel's history, and the thread it is replying in, from the last message it knows of.
- **Reference**: a message's permalink, which names its workspace, channel and timestamp. A Change may link one as optional context. Messages can be edited, deleted or expire, so a permalink is never required evidence.
- **Signals**: reactions on the conversation's top-level message, added by the project's signalling account. The state is one of 🟢 `large_green_circle` (active), 🟡 `large_yellow_circle` (waiting), 🔴 `red_circle` (blocked) and ✅ `white_check_mark` (concluded). The next actors are the reactions of their display markers, and 👤 `bust_in_silhouette` for a person. Slack lets only the account that added a reaction remove it, so the project's setup names one signalling account, and reactions from any other account are not signals. Fewer or more than one state reaction from that account means the signals are inconsistent, and the thread decides.
- **Limits**: Slack takes no idempotency key for a send. A send retried after an uncertain failure can post twice. Reading the thread before retrying reduces that risk and does not remove it. Slack has no atomic replace of a reaction: a change of signal is an add and a remove, and a reader in between sees both. A custom emoji that the workspace lacks cannot be added, and Slack caps the reactions one account may add to a message.
