# Release 0.0.1: Change (A to B)

This is `release/C1`, a PLAN Change. It ships no code and no package. It references the target in [intent.md](intent.md), [requirements.md](requirements.md), [architecture.md](architecture.md) and [testing.md](testing.md) by id and does not restate it. It ends when the Release target above is reached by `kaal-release` 0.0.1 and the DO Change has been accepted.

The Owner asked for "some basic setup with a skill, potentially mnemonics if we have some for release work already".

## A: the present

No `kaal-release` package exists. General release guidance is mixed into KAAL's own Delivery work (`engineering/release/`, and `engineering/release-management/` landing from its collector). Both stay as they are.

## The gap and the route

1. This PLAN, approved by exact-head CPO review. Lands in a clean `kaal/release` collector (squash).
2. DO: create the package shape from architecture.md, write the Cases RED, then GREEN: T1 to T9.
3. Acceptance on the packed artifact in a clean directory.
4. Release of `kaal-release` itself is the final step, after release management is on `main`, with its own explicit Owner go.

## Interim and temporary

- The PR currently targets `main` as a draft only because the collector `kaal/release` carries a stray commit of this PLAN. It ends when the collector is recovered without destroying unique commits and the PR retargets it.
- T5 reads forbidden identities from the Delivery target, which is not on `main` yet. Until it lands, T5 is written against the collector's copy and is marked as interim.

## Out of scope

- Releasing `kaal-release`.
- The Release engine (`engineering/release-management/05-src/release-engine/`), owned by Engineering.
- Any new mnemonic; existing ones are reused (see architecture.md).

## USE vs BUILD

| Need | Decision | Why |
| --- | --- | --- |
| Skill format check | USE `kaal-engineer-skill` checker | It already decides `standard` and `kaal` conformance. |
| Version rules | USE Semantic Versioning 2.0.0 | An industry standard; the Skill cites it. |
| Publishing identity and provenance | USE npm trusted publishing and provenance | The registry's own mechanism; no equivalent to build. |
| Markdown reading in tests | USE `commonmark` | A parser does what a hand-written reader would do. |
| Release engine for consumers | NOT in 0.0.1 | It is KAAL's realization; whether any part generalizes is a later Change with its own USE vs BUILD. |
| Version comparison script | NOT in 0.0.1 | The `semver` package exists; a Script level is added only when a behaviour must repeat exactly. |



## Open for the Owner

1. Package name: `@kaihacksai/kaal-release`, scoped like the other consumer-facing packages, is the default.
2. Skill-only 0.0.1 (default) or with a first Script.
3. Safe repair of the `kaal/release` collector, preserving unique commits. No reset, promotion or publication is authorized.
