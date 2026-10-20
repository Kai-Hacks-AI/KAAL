# kaal-agents

KAAL Agents: the capability for an Agent's readiness and operation within KAAL, reconstructing its working context from durable sources with little or no prompting and entering productive work, whether KAAL is engineered in the repository, embedded there, or used from outside it. It is not part of Core. Core provides the `KAAL Capability` type, the `KAAL Agent` kind and admission, and this capability joins through them.

```
capability/Agents.md     the Capability Node, typed by Core's KAAL Capability
ownership.kaal.json      Agents' own ownership claim (repository data, not delivered)
```

## Responsibilities

This package establishes the capability only. It defines no readiness contract yet, registers no Agent, keeps no session state, and assumes nothing of a host: no host is relied on to load anything without being asked. What a KAAL Agent is and how Agents are registered and discovered stay with Core. The first readiness contract comes in as a KAAL Definition of its own, in a Change of its own.

## Register the Node

```sh
npx kaal register capability agents node_modules/kaal-agents/capability    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
