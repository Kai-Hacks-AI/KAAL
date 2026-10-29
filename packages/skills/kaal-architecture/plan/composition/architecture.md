# Optional Composition with Requirements: Architecture

Each element names, in brackets, the Requirements it answers.

- **architecture/A5** [architecture/F7, architecture/F8]: `payload/Placement.md` is a third Node beside `Architecture` and `URBAN`, registered with the Capability's contribution. Graph's existing Edges carry the citation, and Graph's `check()` reports an unresolved or superseded one. That needs no Graph, Core or Requirements Change.
- **architecture/A6** [architecture/N3, architecture/N4]: Architecture finds Requirements only as Nodes present in the same Engine. It looks them up by name through Graph, never by importing or detecting a package. Removing Requirements removes its Nodes. Architecture's Nodes, record and Skill do not change.
- **architecture/A7** [architecture/F9, architecture/F10]: The Agent Skill gains one section, "With Requirements", that covers both states and the retained citation. It adds no script.
- **architecture/A8** [architecture/F8]: What Requirements makes of these Edges is Requirements'. For example, it can list conditions that no Placement targets. That is its own PLAN's reciprocal expectation, coordinated with but not written by this Change.
- **architecture/A9**: These are not planned. Core's registration of trace rules (`core/C24`, #518) is a separate step: once it lands, `Placement`'s outgoing rule can be registered there in its own Change. A composition registry, an integration package and a pinned version pair are not planned either.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `architecture/C5` DO, LOVE (#485), unchanged | Architecture | `architecture/C6` (#524) |
| `architecture/C8` PLAN, this Change | Architecture | `architecture/C5` |
| `requirements/C1` PLAN (#590): Requirements' own composition expectations | Requirements | none (coordinated with `architecture/C8`) |
| `architecture/C9` SYNC main → kaal/architecture, once `kaal/requirements` carrying the Requirement Definition (#553) is promoted; that promotion needs no Architecture Change, so `requirements/C2` waiting on `architecture/C11` makes no cycle, so both packages can be packed together | Architecture | `architecture/C8`, Requirements' promotion |
| `architecture/C10` the planned tests, written and recorded RED | Architecture | `architecture/C9` |
| `architecture/C11` DO: `Placement`, the Skill section, the Node sentence; GREEN | Architecture | `architecture/C10` |

Promoting `kaal/architecture` to `main`, and any publication, are separate Owner decisions and are not planned here.
