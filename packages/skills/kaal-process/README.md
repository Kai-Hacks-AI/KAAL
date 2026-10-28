# kaal-process

KAAL Process: the capability for the shared Process metamodel, the generic concepts through which any capability describes its own repeatable ways of working. It is not part of Core. Core provides the `KAAL Capability` and `KAAL Definition` types and admission, and this capability joins through them.

```
capability/Process.md             the Capability Node, typed by Core's KAAL Capability
capability/Process-Definition.md  the Process Definition, typed by KAAL Definition: Process, Activity, Role, State and Transition, Ordering, Entry and Exit conditions
capability/PDCA.md                the PDCA Definition, typed by KAAL Definition: Plan, Do, Check, Act as a recursive learning and improvement cycle
ownership.kaal.json               Process's own ownership claim (repository data, not delivered)
```

## Responsibilities

Process owns the metamodel's concepts and their meaning, and nothing a consumer describes with them. Each capability keeps its own processes: their purpose, activities, rules, applicability and decisions, and which States and Transitions they have. A Role is fulfilled by an actor, a human, a CASE Agent or another authorized participant, and is not an Agent. A State is derived from observable facts. Process keeps no registry; a process stays in the context of the capability that defines it, and describing it as a Process makes nothing mandatory. PDCA is the generic, recursive learning and improvement cycle: inner cycles feed the enclosing Check and never substitute for it, Act preserves knowledge for later Plans and changes nothing by itself, and branches and pull requests realize a cycle without owning it.

## Register the Nodes

```sh
npx kaal register capability process node_modules/kaal-process/capability    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
