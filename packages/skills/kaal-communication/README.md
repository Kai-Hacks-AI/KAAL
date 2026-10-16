# kaal-communication

KAAL Communication: how Agents and people coordinate through conversation, with one meaning whatever system carries the messages. It is not part of Core. Core provides the `KAAL Skill` and `KAAL Definition` types and admission, and this capability joins through them.

```
payload/Communication.md            the Skill Node, typed by Core's KAAL Skill
payload/Transport.md                the Definition every Transport Extension realizes
skills/kaal-communication/          the Agent Skill: SKILL.md
```

The Nodes carry what Communication means to KAAL. The Agent Skill tells an Agent how to do the work and points to the Nodes. It assumes no host and no particular Transport.

## Conversation is throwaway

Communication is for coordination: discussion, questions, alignment, handing work over. It is not KAAL state and not a system of record, so this package persists, synchronizes and recovers nothing. Durable work lives with the Change that carries it (its intent, implementation, evidence, review and approval) and in the capability's definitions. A Change stands on its own, with everything it needs inside it, and never references the conversation behind it. A conversation ends in self-contained Changes or concludes that none is needed, and an idea goes to an existing Change, then an existing conversation, before a new one.

## Boundaries

This package knows no Transport. It names no system, depends on no Transport Extension, and its examples use fictional participants only. A Transport Extension depends on it, never the other way around: its realization is a Node typed by `Transport`, which Core admits only into an Engine that already holds this package's `Transport`. Repository acceptance checks both directions.

`Transport` is deliberately small. Every Transport realization is typed by its exact id, so any change to it is a new `Transport` that every realization must be re-pinned to.

## Register the Nodes

```sh
npx kaal register skill kaal-communication node_modules/kaal-communication/payload
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
