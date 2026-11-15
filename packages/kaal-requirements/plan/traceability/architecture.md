# Traceable Requirements: Architecture

Each element names, in brackets, the Requirements it answers.

- **requirements/A11** [requirements/F12, requirements/F13]: `capability/Serves.md` is a Definition beside `Requirement` and `Placement Observation`, admitted with the Capability's contribution. Its outgoing rule, a `Requirement` Node to an Intent Node, is stated in its body. Registering it as a Core trace rule (`core/C24`, #518) is a later Change.
- **requirements/A12** [requirements/F12, requirements/F15]: A consumer's Requirement Node is an ordinary Node in Form, typed by `Requirement`, named by its identifier, with its statement in the body and `Serves` Edges in its frontmatter. Where it lives is the owning capability's, inside its own location, so ownership claims (P3) attribute it. Graph's `createNode` builds it, and nothing new is needed.
- **requirements/A13** [requirements/F13]: An Intent Node is Intent's to define: its Definition, its name and its location. Intent has confirmed (2026-10-31) that an Intent element becomes a Node typed by Intent's existing Definition `Intent`, named `<capability>/I<n>` under Intent's own identification rule, owned by the capability whose Intent it is, and with no Edges out. It becomes a Node when a Change first states it as changed, or when a `Serves` Edge first needs it as a target. The matching Intent PLAN is Intent's, coordinated with this one.
- **requirements/A14** [requirements/N6, requirements/F15]: Bracket citations are not parsed. A deriver from prose was considered and not planned: it would make a text convention the authority, and add a script that `requirements/N3` excludes.
- **requirements/A15**: These are not planned: migrating any capability's plan files, a Requirement registry, a reverse Edge, and the Architecture → Requirement relationship, which is Architecture's: it reuses `Placement` (#588), whose targets are the Requirement Nodes named here.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `requirements/C10` PLAN, this Change | Requirements | #553 |
| Intent's PLAN: Intent Nodes addressable by name and id | Intent | none (coordinated with `requirements/C10`) |
| `requirements/C11` the planned tests, written and recorded RED | Requirements | `requirements/C10` |
| `requirements/C12` DO: `Serves`, the Definition sentence, the Capability Node; GREEN | Requirements | `requirements/C11`, Intent's Definition `Intent` on `kaal/requirements` |
| Each capability's first Requirement Nodes, in the Change that first states them as changed | each capability | `requirements/C12` |
| `engineering/C11` DO | Engineering | P1–P3 |

Promoting `kaal/requirements` to `main`, and any publication, are separate Owner decisions and are not planned here.
