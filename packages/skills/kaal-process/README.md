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

## Assurance

This package delivers Definitions only: three Nodes and no code. It promises no tests a consumer runs. Its assurance is the publisher's: `test/process.test.mjs`, which is not shipped, checks each Node's Form and type, admission into a fresh Engine by Core alone, Process's ownership claim, exactly what the package packs, and the contract's key statements as written. Whether the Nodes say the right thing is validated by review, not by a test.

A consumer verifies independently with Core, which needs nothing from this package:

```sh
npx kaal identify node_modules/kaal-process/capability/*.md    # compare with the ids below
npx kaal register capability process node_modules/kaal-process/capability
npx kaal verify                                               # the Engine admits every Node
```

Registration is all or nothing: Core refuses the whole contribution, and writes nothing, if any Node is out of Form or its type does not resolve. The ids are the SHA-256 of each Node's exact bytes, so a match is the published content, byte for byte:

```
a87a0549939ca29ec153d899c4a5fb84b2fdc59cb432e7463a609ba5302c8b43  capability/Process.md             Process, KAAL Capability
7764218e21c91a40af1350669d0bc5987d708d0fcae8ae1fac33f2df50006947  capability/Process-Definition.md  Process, KAAL Definition
b84f21b5c9ac02a44d92935f3beb560d68e620ada5845a9f2fbd5b2134deb305  capability/PDCA.md               PDCA, KAAL Definition
```

## Roles elsewhere

A Process Role is generic: a responsibility within a Process, fulfilled by an actor. Roles another capability defines, such as Controls' VARISC roles, stay that capability's in meaning and assignment. Process neither defines them nor maps them onto its Role. Whether and how such roles are described through the Process metamodel is decided with their owner in a later Change.

## License

MIT. See `LICENSE`. The license covers this package's contents only.
