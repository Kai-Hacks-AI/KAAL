# kaal-agents

KAAL Agents: the capability for an Agent's readiness and operation within KAAL, reconstructing its working context from durable sources with little or no prompting and entering productive work, whether KAAL is engineered in the repository, embedded there, or used from outside it. It is not part of Core. Core provides the `KAAL Capability` type, the `KAAL Agent` kind and admission, and this capability joins through them.

```
capability/Agents.md     the Capability Node, typed by Core's KAAL Capability
capability/NEW.md        the NEW Definition, typed by KAAL Definition: Agent readiness with little or no prompting
capability/PREACH.md     the PREACH Definition, typed by KAAL Definition: Program → Agent → Human escalation
bin/kaal-agents.mjs      orient (NEW) and preach check (PREACH)
lib/                     orientation, Git, Core's catalog and the PREACH check
skills/kaal-agents/      the Skill: starting work from durable sources, escalating through PREACH
docs/                    the product contract: Intent, Requirements, Architecture, Operations, Limitations, Testing
test/consumer/           the delivered cases, run against the installed copy
test/verify.mjs          the consumer's verification, with its manifest test/verify.json
ownership.kaal.json      Agents' own ownership claim (repository data, not delivered)
```

## Responsibilities

This package establishes the capability only. It registers no Agent, keeps no session state, and assumes nothing of a host: no host is relied on to load anything without being asked. What a KAAL Agent is and how Agents are registered and discovered stay with Core. NEW, Next Experience Works, states the readiness ambition; how an Agent finds what is registered stays a matter of realization through Core's registry. PREACH, Program Reports Errors, Agent Consults Human, states how an Agent operates when a program reports what it cannot resolve; it cites HAPTIC, which Controls owns, and authorizes nothing.

## Register the Nodes

```sh
npx kaal register capability agents node_modules/kaal-agents/capability    # Core decides
```

## Documentation

- [Intent](docs/intent.md): why Agents exists.
- [Requirements](docs/requirements.md): what it promises.
- [Architecture](docs/architecture.md): where each promise is realized.
- [Operations](docs/operations.md): how to install, run and verify it. It is the authoritative Operations document.
- [Limitations](docs/limitations.md): what it does not establish.
- [Testing](docs/testing.md): the cases your installation runs, and what they cover.

## Verify the installation

```sh
node node_modules/kaal-agents/test/verify.mjs
```

It ends in verified, failed or cannot verify, with a summary line a program can read. In this version the package's own `npm test` is still the publisher's suite, so `npm explore kaal-agents -- npm test` does not work in an installation yet. See [Operations](docs/operations.md) and [Limitations](docs/limitations.md).

## License

MIT. See `LICENSE`. The license covers this package's contents only.
