# Project map: Intent

This is `project/C2`, a PLAN Change. It ships no code. A later DO Change turns the planned tests GREEN.

The Owner asked on #279 (2026-10-29) for capability-owned maps of KAAL work. Each capability should produce a deterministic, BASS-conformant map from authoritative KAAL content, within its own scope. No capability should have to keep a second, hand-maintained map, and no capability should need every other capability installed. This PLAN covers Project's map only. Change's map and Product's map are separate PLANs, owned by Change and Product (see `architecture.md`).

- **project/I1.** Project maps what it owns: the Projects, the Normal Changes each one governs, its grouping and its project-level sequencing. It does this from its Project Plans, as their owner.
- **project/I2.** Project never states a dependency between Changes. Depends On is Change's. When Change's map is available, Project consumes its dependencies unchanged and attributed to Change. When it is not, no dependency appears.
- **project/I3.** The map works alone. A governed Change that Project cannot resolve, because Change's map is absent or does not hold it, is shown as unresolved. It is never dropped and never invented.
- **project/I4.** The map composes. Combined with Change's map, and later Product's, each relation keeps its kind and its owner, so dependency, grouping, sequencing, priority, readiness and lifecycle stay distinct in the model and in every rendering.
- **project/I5.** The map is repeatable. Identical authoritative inputs and declared configuration give byte-identical output. Its first rendering is the Markdown tree already used for the review queue.
