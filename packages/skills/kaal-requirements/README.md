# kaal-requirements

KAAL Requirements: the capability for stating what must hold, the functional and non-functional conditions that what is built is to satisfy, each with the context responsible for it and precise enough to be verified. It is not part of Core. Core provides the `KAAL Capability` type and admission, and this capability joins through them.

```
capability/Requirements.md   the Capability Node, typed by Core's KAAL Capability
ownership.kaal.json          Requirements' own ownership claim (repository data, not delivered)
```

## Responsibilities

This package establishes the capability only. It defines no Requirement form yet, keeps no requirements, store, registry or traceability, and adds no workflow. A Requirement states what must hold, and only that: why is Intent's, where is Architecture's, how is Code's, and whether it holds is Testing's. It may trace to an Intent where one is represented, without depending on it. What prompts a Requirement is its trigger, which is neither the Requirement nor an Intent. What a Requirement is comes in as a KAAL Definition of its own, in a Change of its own.

## Register the Node

```sh
npx kaal register capability requirements node_modules/kaal-requirements/capability    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
