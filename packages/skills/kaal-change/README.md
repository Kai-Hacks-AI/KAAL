# kaal-change

KAAL Change: the capability for what a Change is, what it must contain to stand on its own, and the lifecycle it passes through, independent of any technology that carries it. It is not part of Core. Core provides the `KAAL Capability` and `KAAL Definition` types and admission, and this capability joins through them.

```
capability/Change.md              the Capability Node, typed by Core's KAAL Capability
capability/Change-Definition.md   the Change Definition, typed by KAAL Definition: meaning, self-containment and lifecycle
ownership.kaal.json               Change's own ownership claim (repository data, not delivered)
```

## Responsibilities

A Change is one bounded, self-contained alteration proposed to what KAAL holds. Its lifecycle has five states: Defined, Proposed, Approved, Integrated and Withdrawn. A pull request and its merge are one realization of a Change and of its steps, and how they move is engineering. Integrating a Change never proves that the Intent it realizes achieved its Outcome.

## Register the Nodes

```sh
npx kaal register capability change node_modules/kaal-change/capability    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
