# Optional Composition with Architecture: Architecture

Each element names, in brackets, the Requirements it answers.

- **requirements/A1** [requirements/F1, requirements/F2]: Requirements finds Architecture only as Nodes present in the same Engine: a Node named `Placement` (Graph `named`) and the Edges of that type (Graph `edges`, or `in(id)` for one Requirement). It never imports or detects a package. Removing Architecture removes its Nodes; Requirements' Nodes do not change.
- **requirements/A2** [requirements/F4, requirements/F6]: Graph's `check()` already reports an Edge whose target is absent or has another id, and Core's `verify` stays ok with one. Graph's `named` and `resolve` find a Node by name or by name and id. So "placed against an earlier version", and an observation's currency, need no Graph, Core or Architecture Change.
- **requirements/A6** [requirements/F3, requirements/F6]: `capability/Placement-Observation.md` is a second Definition beside `Requirement`, admitted with the Capability's contribution. An observation is made with Graph's existing `createNode`, and written and read by the consumer through Hosting, so this needs no new API. Whether the DO adds a small helper that builds and reads an observation is decided in `requirements/C3` by what the tests need; the PLAN does not presuppose one.
- **requirements/A3** [requirements/F5]: The guidance is text: one paragraph in the Capability Node and one README section, which matches `architecture/C8`. Requirements has no Agent Skill today, and this PLAN adds none.
- **requirements/A4** [requirements/F1]: What Architecture makes of a Requirement is Architecture's (`architecture/F7`–`F11`). Architecture expects of Requirements only that a Requirement Node is addressable by name and id, which Graph already gives.
- **requirements/A5**: These are not planned. A Requirements store or traceability record, a composition registry, an integration package and a pinned version pair are not planned. Registering `Placement`'s trace rule under `core/C24` (#518) is Architecture's.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| #276 the Capability, merged | Requirements | none |
| #553 the Requirement Definition | Requirements | #276 |
| `requirements/C1` PLAN, this Change | Requirements | #276 |
| `architecture/C8` PLAN (#588): Architecture's own expectations | Architecture | none (coordinated with `requirements/C1`) |
| `requirements/C2` SYNC main → kaal/requirements, once `kaal/architecture` carrying `architecture/C11` (`Placement`) is promoted, so both packages can be packed together | Requirements | `requirements/C1`, Architecture's promotion |
| `requirements/C3` the planned tests, written and recorded RED | Requirements | `requirements/C2`, #553 |
| `requirements/C4` DO: `Placement Observation`, the Node paragraph and README section; GREEN | Requirements | `requirements/C3` |

There is no cycle: Architecture's DO needs Requirements on main (#276, #553), not this PLAN's DO. Promoting `kaal/requirements` to `main`, and any publication, are separate Owner decisions and are not planned here.
