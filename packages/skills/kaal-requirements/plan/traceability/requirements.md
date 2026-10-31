# Traceable Requirements: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **requirements/N5** [requirements/I8]: Requirements adds no script, store or index. `requirements/N1` and `requirements/N3` stay as they are. Graph supplies the traversal (`traverse`, `in`, `out`), which is on `main` today.
- **requirements/N6** [requirements/I9]: Nothing Requirements ships fails, or makes a consumer's Engine stop verifying, because a capability still writes bracket citations.

## Functional

- **requirements/F12** [requirements/I8]: **Identification.** A Requirement is identified as `<capability>/F<n>` (functional) or `<capability>/N<n>` (nonfunctional): the capability that owns it, its kind, and a positive integer that the owning capability assigns once and never reuses. That identifier is the name of its Node. A Requirement's Node is typed by `Requirement`.
- **requirements/F13** [requirements/I7, requirements/I8]: **The relationship.** Requirements provides one relationship Definition, `Serves`, typed by Core's `KAAL Definition`. A Requirement Node states the Intents it serves as Graph Edges of type `Serves` in its own frontmatter, each target by the Intent Node's name and id. The Edges go out from the Requirement, so its owner owns them. There is no reverse Edge. The Definition states that serving an Intent transfers no ownership, and that a Requirement's trigger is not an Intent (#553).
- **requirements/F14** [requirements/I7]: An Edge pins its target's id. When an Intent changes, a `Serves` Edge that still names the earlier id is read as **serving an earlier version**: Graph's `check()` reports it, and the Requirement's owner re-pins it in its own Change. It is never rewritten by anyone else, and never read as false.
- **requirements/F15** [requirements/I9]: **Incremental.** A capability moves a Requirement to a Node, with its `Serves` Edges, no later than the Change that first states it as a changed element (`engineering/C11`, P1). Until then, its bracket citation stays as it is, and is not a trace. No capability migrates another's Requirements.
- **requirements/F16** [requirements/I7, requirements/I8]: The Definition `Requirement` gains one sentence: a Requirement states the Intents it serves as `Serves` Edges, where they are represented, and none where none is. The Capability Node names `Serves` among what it provides.
