# Guard: Intent, Engineering's part (why)

Guard's product contract, its Intent, Requirements, Architecture, Testing and Limitations, is authoritative in the package: [`packages/kaal-guard/docs/`](../../packages/kaal-guard/docs/intent.md). The product's outcomes are guard/I1–guard/I3, guard/I5 and guard/I7–guard/I9. This page holds only what KAAL Engineering adds: how KAAL itself uses Guard, and how it delivers Guard into a target without the package.

## Engineering's outcomes

- **guard/I4 Engineer.** KAAL's own checks run through Guard, locally and in KAAL's existing CI, with no loss of check identity, OS matrix or coverage. The product obligations it relies on are guard/F10 and guard/N1.
- **guard/I6 External.** KAAL Engineering delivers Guard naked into a target as an actual Change: working hooks, working CI and local docs, adding neither the package nor any KAAL element. guard/I7 holds for an External delivery too (guard/F25), and so does guard/F8's rule for the target's existing files.

The mission is met only when guard/I1 to guard/I6 all hold. guard/I7 is the separately scoped `0.0.2` improvement ([Change](change.md#agent-guidance)). guard/I8 and guard/I9 are the separately scoped `0.0.4` increment ([Change](change.md#consumer-verification-004)). Reaching some of them is a checkpoint, not completion ([Change](change.md#stopping-conditions)).

## Boundaries

- Guard carries no branching policy. KAAL's branching checks are ordinary KAAL checks that Guard runs, like any consumer's checks.
- Guard's Agent Skill, `kaal-guard`, is shipped with Guard and delivered by it. It is not a CASE registration, which stays with #331 and #258.
- Testing owns what evidence means. The repository owns its test content.
