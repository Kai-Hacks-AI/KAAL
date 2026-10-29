# kaal-service

KAAL Service: what a Service is, the one Capability accountable for providing it, what consumes it, who owns it as a role, what it rests on, and the Agreements about it. It is not part of Core. Core provides the `KAAL Capability` and `KAAL Definition` types and admission, Graph relates and navigates Nodes, and this capability gives two relationships their meaning.

```
capability/Service.md              the Capability Node, typed by Core's KAAL Capability
capability/Service-Definition.md   the Service Definition: Nodes it types are Services
capability/provides.md             the provides Definition: Capability -> Service
capability/consumes.md             the consumes Definition: any CASE kind -> Service
capability/composes.md             the composes Definition: Service -> Service it rests on
capability/Agreement.md            the Agreement Definition: Nodes it types are SLAs, OLAs or UCs
capability/covers.md               the covers Definition: Agreement -> Service
capability/underpins.md            the underpins Definition: OLA or UC -> SLA
ownership.kaal.json                Service's own ownership claim (repository data, not delivered)
```

## What it defines

- **A Service** is an offering: a Node typed by the `Service` Definition. Its identity is that Node's.
- **`provides`** is an Edge from a Capability to a Service it is accountable for. Exactly one Capability provides a Service. Being accountable does not mean delivering every part: a Service may be composed of others, delivered elsewhere.
- **`consumes`** is an Edge from a Capability, an Agent, a Skill or an Extension to a Service it depends on.
- **A Service's owner** is a role label the Service declares as `owner` in its own frontmatter. It is not an Edge and not resolved: it names a role and carries no role identity. It is independent of the Capability that provides the Service.
- **`composes`** is an Edge from a Service to each Service it rests on. Internal or external is context, not a type.
- **An Agreement** is a Node typed by the `Agreement` Definition. It declares its `kind` (`SLA`, `OLA` or `UC`) and its `parties`. The kind is declared, never derived.
- **`covers`** is an Edge from an Agreement to the Service it is about, and **`underpins`** is an Edge from an OLA or a UC to the SLA it supports.

A provider never enumerates its consumers. Every relationship is an Edge carried by its source Node, so Graph derives a Service's provider, consumers, supported Services and Agreements from the Nodes that declare them. There is no registry, and nothing is inferred from packages or directories.

Nothing here checks yet that a Service has exactly one provider or a declared owner, that a relationship's source is of an allowed kind, or that an Agreement's kind fits its parties. Core admits a Node when its type resolves and does not read Edges; Graph reports only whether references resolve.

## Boundaries

The four CASE kinds are Core's and unchanged. Edge mechanics are Graph's and unchanged. A resolvable organizational role, the model drawing and its views are not defined here.

## Register the Nodes

```sh
npx kaal register capability service node_modules/kaal-service/capability
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
