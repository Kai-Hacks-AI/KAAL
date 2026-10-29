# Project map: Intent

This is `project/C2`, a PLAN Change. It ships no code. A later DO Change turns the planned tests GREEN.

The Owner asked on #279 (2026-10-29) for capability-owned maps of KAAL work. Each capability should produce a deterministic, BASS-conformant map from authoritative KAAL content, within its own scope. No capability should have to keep a second, hand-maintained map, and no capability should need every other capability installed. This PLAN covers Project's map only. Change's map and Product's map are separate PLANs, owned by Change and Product (see `architecture.md`).

- **project/I1.** Project maps what it owns: the Projects, the Normal Changes each one governs, its grouping and its project-level sequencing. It does this from its Project Plans, as their owner.
- **project/I2.** Project never states a dependency between Changes. Depends On is Change's (#530). When Change's complement is available, Project consumes its declared Depends On facts unchanged and attributed to Change, without redefining them. When it is not, no dependency appears.
- **project/I3.** The map works alone. A governed Change that Project cannot resolve, because Change's complement is absent or does not hold it, is shown as unresolved. It is never dropped and never invented.
- **project/I4.** The map composes. Combined with Change's complement, and later with Product's, every relation keeps its qualified identity (its name and its owning capability) and its provenance. Project sequencing, Change dependencies, Product priority, readiness and lifecycle therefore never merge into one another, in the model or in any rendering. Project owns the contract and the meaning of its own map, and of no one else's.
- **project/I5.** The map is repeatable. Identical authoritative inputs and declared configuration give byte-identical output. Its first rendering is the Markdown tree already used for the review queue.
