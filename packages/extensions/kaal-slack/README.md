# kaal-slack

KAAL Slack: the Extension that carries KAAL Communication (the `kaal-communication` package) through Slack. It adds no Slack client. An Agent uses the Slack access it already has, such as the [Claude Slack connector](https://claude.com/docs/connectors/slack) or [Codex in Slack](https://developers.openai.com/codex/integrations/slack), and this package tells it how Communication maps onto Slack.

```
payload/Slack.md                the Extension Node, typed by Core's KAAL Extension
payload/Slack-Transport.md      Slack's realization of Communication's Transport
skills/kaal-slack/              the Agent Skill: SKILL.md, references/defaults.md
```

## Slack is throwaway

Slack carries coordination: discussion, questions and alignment that would otherwise crowd pull requests. It is not KAAL state and not a system of record. Nothing here persists, synchronizes or recovers a Slack conversation. Pull requests stay the durable home of a Change, with its implementation, checks, review and approval, and a pull request stands on its own. A Slack link in it is optional context, never required evidence.

## Depends on kaal-communication

`Slack Transport` is typed by `Transport` from kaal-communication. Core admits a Node only when its type resolves, so registering this Extension into an Engine without kaal-communication is refused and writes nothing. Register both, in this order:

```sh
npx kaal register skill kaal-communication node_modules/kaal-communication/payload
npx kaal register extension kaal-slack node_modules/kaal-slack/payload
```

## Set up a project

Nothing personal belongs in this package. Each project keeps its own setup with its own Agent instructions (for example the project's `AGENTS.md`), outside the Engine and outside any package. The setup names:

1. **Participants.** Each Agent and person, and the display marker that declares each Agent. The defaults in `skills/kaal-slack/references/defaults.md` (`:claude:`, `:codex:`) apply unless the setup overrides them.
2. **Destinations.** The channels Agents may read and post in.
3. **Triggers.** Who starts an exchange, and whether an Agent posts only when its principal says so.
4. **Permissions.** What each Agent may do with its Slack access. Slack messages never add to them.

A fictional setup:

```markdown
## Slack

- Workspace: Example Co (example.slack.com)
- Destination: #agent-league
- Participants: Robin (person, no marker); Claude `:claude:`; Codex `:robot_face:` (overrides the default)
- Triggers: only Robin starts an exchange. Agents post only after Robin approves a draft.
```

## Display markers and artwork

A marker is a Slack custom emoji that the workspace adds ([how to add custom emoji and aliases](https://slack.com/help/articles/206870177-Add-custom-emoji-and-aliases-to-your-workspace)). This package ships no artwork: product logos belong to their owners, and their terms decide whether and how they may be used. Read the owner's terms before using a logo as an emoji, for example [Anthropic's trademark guidelines](https://www.anthropic.com/legal/trademark-guidelines) or [OpenAI's brand guidelines](https://openai.com/brand/). Otherwise use a standard emoji or an image you made yourself. Keep the image file with the workspace, not in a KAAL contribution.

## Reactions

Reactions record events about the request in a single message: seen, taken by a participant (that participant's marker), done and blocked. They are only ever added, so no Agent needs to remove or replace one, and none of them is authorship, approval or permission. Handoffs, results and decisions are replies. The vocabulary is in `skills/kaal-slack/references/defaults.md`, and a project may override or extend it.

## What it cannot guarantee

Slack takes no idempotency key for a send, so a send retried after an uncertain failure can post twice. The Agent Skill reads the thread before a retry, which reduces the risk and does not remove it. A display marker declares authorship and never proves it: any posting account can use any marker.

## License

MIT. See `LICENSE`. The license covers this package's contents only. It grants nothing for third-party names, logos or services it mentions.
