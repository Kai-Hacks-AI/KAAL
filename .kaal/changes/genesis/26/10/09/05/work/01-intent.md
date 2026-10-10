# Intent

KAAL uses the same Skills and Extensions in three operating modes, and a KAAL can find out which it holds, discover more from a source it is given, obtain them and make them available, without anyone confusing a capability's meaning with its package, its delivery or where it came from.

## The three operating modes

These are operating modes of one KAAL, not three capability architectures.

1. **Engineer**: KAAL uses its capabilities to advance KAAL itself.
2. **Embed**: KAAL is installed into another repository and operates there.
3. **External**: KAAL operates on another repository, the Subject, without installing KAAL into it. KAAL's Engine and Records stay elsewhere. External is not "reaching an installed KAAL remotely".

## Outcome

- An instance says which Skills and Extensions it holds, from Core, offline.
- Given a source, local or remote, an instance can discover what the source offers, obtain a chosen capability's bytes, verify them, and have them installed where installation is appropriate.
- The instance stays in control of its composition: nothing is added that was not chosen.
- The same capabilities are usable in Engineer, Embed and External, and External requires no KAAL artifact in the Subject.

## Why

A host that holds only Core (Enercon) cannot list or add a capability: the commands that do so live in KAAL's source repository, which the host does not have. Behind that, capability identity, package identity, delivery naming and Agent Skill naming are easy to run together. Core already establishes a capability's identity; the rest should consume that and add no second authority.

## Boundaries

- A capability is identified by its Node, not by its package, delivery directory, Agent Skill name or source location. Core establishes capability identity. Sources provide bytes. Installation makes capabilities available. The operating mode determines where KAAL acts.
- Installed capability discovery, source discovery, acquisition and installation are four responsibilities. They are not collapsed into one registry, package manifest or CLI concept.
- Packaging (a future `kaal-packaging` Skill) is the delivery capability for obtaining the Engine, capabilities and their dependency bytes. npm packages are its first candidate source, not a KAAL identity and not a permanent mechanism; other sources may follow. Packaging asks Core what is available and does not become an authority for capability meaning. Package names, versions and npm dependency metadata are never a capability's identity. Packaging is not implemented here.
- Composition (this Change) chooses capabilities by exact Node ID, resolves what the target Engine must hold, and verifies that the resulting composition is valid, without refusing less than the installer does today and without duplicating npm's dependency machinery.
- Offline operation: an embedded KAAL works with what it holds, with no network, central registry, access to KAAL's engineering repository or particular LLM provider. Acquiring more is a separate operation. The smallest useful source mechanism comes first; remote acquisition is not a prerequisite unless shown necessary.
- The Engine / Record / Subject separation settled by Change `genesis/26/10/08/03` is respected. The Subject does not acquire KAAL artifacts because KAAL operates on it.
- Core is not extended merely to simplify packaging or a CLI. No registry, new Core semantics or general distribution framework without demonstrated necessity.
- Nothing is implemented, sealed or closed by this Change's current Work. Enercon is not modified.

## Done when

KAAL can determine which capabilities it holds, discover additional capabilities from an available source, acquire and verify them, and make them available through installation where appropriate; the same capabilities work in Engineer, Embed and External; and External operation needs no KAAL installation in the Subject.

## Origin

The Owner's comments and briefing on PR #69 (2026-10-08 and 2026-10-09), including the direction on Packaging and dependency handling. This Intent states the outcome; Requirements and Architecture investigate how.
