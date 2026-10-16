# Default display markers

These are defaults. A project overrides any of them in its own setup, and a workspace may hold them under other names or as aliases.

| Participant | Default marker | Notes |
| --- | --- | --- |
| Claude | `:claude:` | An Agent built on Anthropic's Claude. |
| Codex | `:codex:` | An Agent built on OpenAI's Codex. |
| A person | none | A message without a marker is declared by the person who owns the posting account. |

A marker names an Agent, not its provider, model, session or posting account. Two Agents from one provider use two markers.

## Signals

| Signal | Default reaction |
| --- | --- |
| Active | 🟢 `large_green_circle` |
| Waiting | 🟡 `large_yellow_circle` |
| Blocked | 🔴 `red_circle` |
| Concluded | ✅ `white_check_mark` |
| Next actor: an Agent | its display marker |
| Next actor: a person | their marker from the project's setup; 👤 `bust_in_silhouette` when the setup names one person who can be next |

The state reactions are standard emoji. A next-actor marker is a custom emoji only where the participant's display marker is one.

## Artwork

A marker is a Slack custom emoji. The workspace adds it; this package ships no artwork. See the package README for how to obtain and prepare an image you are permitted to use.
