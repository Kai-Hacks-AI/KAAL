# kaal-agents

KAAL Agents: the capability for an Agent's readiness and operation within KAAL, reconstructing its working context from durable sources with little or no prompting and entering productive work, whether KAAL is engineered in the repository, embedded there, or used from outside it. It is not part of Core. Core provides the `KAAL Capability` type, the `KAAL Agent` kind and admission, and this capability joins through them.

```
capability/Agents.md     the Capability Node, typed by Core's KAAL Capability
capability/NEW.md        the NEW Definition, typed by KAAL Definition: Agent readiness with little or no prompting
ownership.kaal.json      Agents' own ownership claim (repository data, not delivered)
```

## Responsibilities

This package establishes the capability only. It registers no Agent, keeps no session state, and assumes nothing of a host: no host is relied on to load anything without being asked. What a KAAL Agent is and how Agents are registered and discovered stay with Core. NEW, Next Experience Works, states the readiness ambition; how an Agent finds what is registered stays a matter of realization through Core's registry.

## Register the Nodes

```sh
npx kaal register capability agents node_modules/kaal-agents/capability    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
