# Optional Composition with Architecture: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **requirements/N1** [requirements/I1]: The package keeps no dependency, peer dependency or optional dependency on `kaal-architecture`, and names no version of it.
- **requirements/N2** [requirements/I1, requirements/I3]: Nothing Requirements ships fails, refuses to install or stops verifying because Architecture is absent, at another version, or removed.

## Functional

- **requirements/F1** [requirements/I1, requirements/I2]: Requirements' assessment of a Requirement's placement has three values. **Not assessed**: no `Placement` Definition is present in the Engine. It means unknown. It is never "missing" and never a failure. **Placed**: at least one `Placement` Edge reaches the Requirement, and the assessment cites each decision by name and id. **Without architectural response**: `Placement` is present and no Edge of it reaches the Requirement.
- **requirements/F2** [requirements/I2]: Requirements reads `Placement` Edges and owns none. It finds the Definition by name in the same Engine, and the Edges through Graph. It never writes an Edge to a decision, so there is no reverse Edge and no shared object. What a placement means stays Architecture's.
- **requirements/F3** [requirements/I3]: Requirements provides one Definition, `Placement Observation`, typed by Core's `KAAL Definition`. It is the minimal durable result of reading a placement, so that what was observed survives Architecture's removal. An observation is an ordinary Node in Form, typed by `Placement Observation`, and it records:
  - the Requirement it is about, by name and id;
  - the decision observed, by name and id, and the `Placement` Definition observed, by name and id;
  - the value observed: placed or without architectural response;
  - the Architecture package version observed, when it can be read, and the time of observation.

  It carries these as frontmatter fields, not as Graph Edges, so it adds no relationship and transfers no Edge ownership. Its id is the SHA-256 of its bytes, so its integrity can be checked with Graph alone.
- **requirements/F4** [requirements/I3]: If a `Placement` Edge names the Requirement's name with another id, the Requirement is **placed against an earlier version**. That is reported as such, not as a failure and not as placed.
- **requirements/F5** [requirements/I1, requirements/I2, requirements/I3]: The Capability Node `Requirements` states, in one paragraph, what it does with Architecture available and how its observations are read, as F1 to F4 and F6 say, and that reading a placement transfers no ownership. The README carries the same section.
- **requirements/F6** [requirements/I3]: An observation belongs to the consumer that made it. The consumer chooses where it is kept, for example beside its own records, and nothing ships, registers or indexes it for them: there is no store and no registry. Requirements never deletes, rewrites or falsifies one. Reading an observation later gives its currency from what is present then:
  - **current**: the decision and the Requirement are present with the ids it names, and the `Placement` Edge still reaches the Requirement;
  - **retained**: no decision by that name is present, or no `Placement` is present. It is still evidence of what was placed, with its provenance, but it is not re-checkable, and it is never read as current or as false;
  - **earlier version**: the decision or the Requirement is present by name with another id.

  Reinstalling Architecture makes it re-checkable again.
