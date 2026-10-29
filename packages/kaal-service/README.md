# kaal-service

KAAL Service: what a Service is, the one Capability accountable for providing it, and what consumes it. It is not part of Core. Core provides the `KAAL Capability` and `KAAL Definition` types and admission, Graph relates and navigates Nodes, and this capability gives two relationships their meaning.

```
capability/Service.md              the Capability Node, typed by Core's KAAL Capability
capability/Service-Definition.md   the Service Definition: Nodes it types are Services
capability/provides.md             the provides Definition: Capability -> Service
capability/consumes.md             the consumes Definition: any CASE kind -> Service
ownership.kaal.json                Service's own ownership claim (repository data, not delivered)
```

## What it defines

- **A Service** is an offering: a Node typed by the `Service` Definition. Its identity is that Node's.
- **`provides`** is an Edge from a Capability to a Service it is accountable for. Exactly one Capability provides a Service. Being accountable does not mean delivering every part: a Service may be composed of others, delivered elsewhere.
- **`consumes`** is an Edge from a Capability, an Agent, a Skill or an Extension to a Service it depends on.

A provider never enumerates its consumers. Both relationships are Edges carried by their source Node, so Graph derives a Service's provider and consumers from the Nodes that declare them. There is no registry, and nothing is inferred from packages or directories.

Nothing here checks yet that a Service has exactly one provider, or that a relationship's source is of an allowed kind. Core admits a Node when its type resolves and does not read Edges; Graph reports only whether references resolve.

## Boundaries

The four CASE kinds are Core's and unchanged. Edge mechanics are Graph's and unchanged. Agreements about a Service, and who owns a Service as a role, are not defined here.

## Register the Nodes

```sh
npx kaal register capability service node_modules/kaal-service/capability
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
