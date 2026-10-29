# Optional Composition with Architecture: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **requirements/N1** [requirements/I1]: The package keeps no dependency, peer dependency or optional dependency on `kaal-architecture`, and names no version of it.
- **requirements/N2** [requirements/I1, requirements/I3]: Nothing Requirements ships fails, refuses to install or stops verifying because Architecture is absent, at another version, or removed.

## Functional

- **requirements/F1** [requirements/I1, requirements/I2]: Requirements' assessment of a Requirement's placement has three values. **Not assessed**: no `Placement` Definition is present in the Engine. It means unknown. It is never "missing" and never a failure. **Placed**: at least one `Placement` Edge reaches the Requirement, and the assessment cites each decision by name and id. **Without architectural response**: `Placement` is present and no Edge of it reaches the Requirement.
- **requirements/F2** [requirements/I2]: Requirements reads `Placement` Edges and owns none. It finds the Definition by name in the same Engine, and the Edges through Graph. It never writes an Edge to a decision, so there is no reverse Edge and no shared object. What a placement means stays Architecture's.
- **requirements/F3** [requirements/I3]: A placement cited earlier keeps its provenance: the decision's name and id, the Requirement's id it named, and when it was observed. If no decision by that name is present, the citation is **retained**: still evidence of what was placed, but not re-checkable. Requirements does not delete, rewrite or falsify it, and it does not claim it is current. Where a citation is kept over time is its recorder's, not Requirements'.
- **requirements/F4** [requirements/I3]: If a `Placement` Edge names the Requirement's name with another id, the Requirement is **placed against an earlier version**. That is reported as such, not as a failure and not as placed.
- **requirements/F5** [requirements/I1, requirements/I2]: The Capability Node `Requirements` states, in one paragraph, what it does with Architecture available, as F1 to F4 say, and that reading a placement transfers no ownership. The README carries the same section.
