# kaal-process

KAAL Process: the capability for the shared Process metamodel, the generic concepts through which any capability describes its own repeatable ways of working. It is not part of Core. Core provides the `KAAL Capability` and `KAAL Definition` types and admission, and this capability joins through them.

```
capability/Process.md             the Capability Node, typed by Core's KAAL Capability
capability/Process-Definition.md  the Process Definition, typed by KAAL Definition: Process, Activity, Role, State and Transition, Ordering, Entry and Exit conditions
capability/PDCA.md                the PDCA Definition, typed by KAAL Definition: Plan, Do, Check, Act as a recursive learning and improvement cycle, delivered as a Process Template
test/consumer.test.mjs            the consumer's smoke test, shipped: npm run verify
test/nodes.json                   the published Nodes' names, types and ids
ownership.kaal.json               Process's own ownership claim (repository data, not delivered)
```

## Responsibilities

Process owns the metamodel's concepts and their meaning, and the management of processes through it, and nothing a consumer describes with them. Specific processes and their instances stay with the capability whose processes they are. Each capability keeps its own processes: their purpose, activities, rules, applicability and decisions, and which States and Transitions they have. A Role is fulfilled by an actor, a human, a CASE Agent or another authorized participant, and is not an Agent. A State is derived from observable facts. Process keeps no registry; a process stays in the context of the capability that defines it, and describing it as a Process makes nothing mandatory. Process may deliver Process Templates, reusable processes for any capability to adopt. PDCA is one: a template, not an instantiated Change, Engineering or Learning process and not a universal mandatory workflow. A capability that adopts it owns its particular process: its adaptations, applicability, conditions, decisions and realization. In PDCA, the generic, recursive learning and improvement cycle, inner cycles feed the enclosing Check and never substitute for it, Act preserves knowledge for later Plans and changes nothing by itself, and branches and pull requests realize a cycle without owning it.

## Register the Nodes

```sh
npx kaal register capability process node_modules/kaal-process/capability    # Core decides
```

## Assurance

This package delivers Definitions: three Nodes, and no runtime code. Two kinds of assurance stay apart.

**The publisher's assurance** is `test/process.test.mjs`, which is not shipped. Before every release it checks each Node's Form and type, admission by Core alone, Process's ownership claim, exactly what the package packs, and the contract's statements as written. In the Acceptance lane, `test/acceptance/consumer.test.mjs` installs the packed package into a fresh host outside the repository and runs the consumer's smoke test there, with and without `kaal-core`. Whether the Nodes say the right thing is validated by review.

**The consumer's smoke test** ships with the package and runs from the installed copy, with no KAAL source checkout. It needs Node 24 and `kaal-core` installed beside it:

```sh
npm install kaal-process kaal-core
npm explore kaal-process -- npm run verify
```

It checks four things, and fails on any:

- the delivered Nodes are the published bytes: each file's SHA-256 is its id in `test/nodes.json`;
- Core admits them, as one Capability contribution, into a fresh Engine of the test's own, each with its name and type;
- the delivered Process contract says what it promises: Process's scope and Process Templates, each specific process left to its owner, the metamodel's concepts, a Role apart from its actor, and PDCA as a recursive template that mandates nothing;
- without `kaal-core`, it fails as *cannot verify* and names what is missing. It never passes without Core.

`kaal verify` is not a substitute for it: Core verifies an Engine's admission, not what the Process contract says. The ids, for comparison with `npx kaal identify node_modules/kaal-process/capability/*.md`:

```
ed3d9a2255912d2d6b6bd25e6b0e180b5f11c9f82b5d69d8d7f7d8b1e5c65b4b  capability/Process.md             Process, KAAL Capability
7764218e21c91a40af1350669d0bc5987d708d0fcae8ae1fac33f2df50006947  capability/Process-Definition.md  Process, KAAL Definition
5a20888db853950c8921d081814e28e40e9cc812daf12b7b11b69d3d6db347ff  capability/PDCA.md               PDCA, KAAL Definition
```

## Roles elsewhere

A Process Role is generic: a responsibility within a Process, fulfilled by an actor. Roles another capability defines, such as Controls' VARISC roles, stay that capability's in meaning and assignment. Process neither defines them nor maps them onto its Role. Whether and how such roles are described through the Process metamodel is decided with their owner in a later Change.

## License

MIT. See `LICENSE`. The license covers this package's contents only.
