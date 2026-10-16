# Default display markers

These are defaults. A project overrides any of them in its own setup, and a workspace may hold them under other names or as aliases.

| Participant | Default marker | Notes |
| --- | --- | --- |
| Claude | `:claude:` | An Agent built on Anthropic's Claude. |
| Codex | `:codex:` | An Agent built on OpenAI's Codex. |
| A person | none | A message without a marker is declared by the person who owns the posting account. |

A marker names an Agent, not its provider, model, session or posting account. Two Agents from one provider use two markers.

## Reactions

A reaction records an event about the request in the one message it is on. Reactions are only added, never removed or replaced.

| Event | Default reaction | Means |
| --- | --- | --- |
| Seen | 👀 `eyes` | Read, not accepted. |
| Taken | the participant's display marker | That participant takes responsibility for the request. Not authorship, approval or permission. |
| Done | ✅ `white_check_mark` | The request is completed; the result is in a reply or the Change. |
| Blocked | ⛔ `no_entry` | Used only with a reply that explains the blocker. |

The vocabulary may grow. A project's setup may override any of these reactions.

A marker is a Slack custom emoji. The workspace adds it; this package ships no artwork. See the package README for how to obtain and prepare an image you are permitted to use.
