# kaal-intent

KAAL Intent: the capability for capturing what a person or Agent wants to achieve, and why, as a self-contained Intent whatever its source. It is not part of Core. Core provides the `KAAL Skill` type and admission, and this capability joins through them.

```
payload/Intent.md                          the Skill Node, typed by Core's KAAL Skill
skills/kaal-intent/                        the Agent Skill: SKILL.md and references/intent.md
```

The Node carries what the capability means to KAAL. The Agent Skill tells an agent how to capture an Intent and points to the Node. It assumes no host: a host places `skills/kaal-intent/` wherever it keeps skills.

## Responsibilities

This Skill defines what an Intent is and how one is captured: a minimal Markdown document stating what is wanted and why. It does not decide where Intents are kept, relate them to requirements, Changes or each other, or decide whether anything is done about them.

## Register the Node

```sh
npx kaal register skill kaal-intent node_modules/kaal-intent/payload    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
