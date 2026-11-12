# Release 0.0.1: Change (A to B)

This is `release/C1`, a PLAN Change. It ships no code and no package. It references the target in [intent.md](intent.md), [requirements.md](requirements.md), [architecture.md](architecture.md) and [testing.md](testing.md) by id and does not restate it. It ends when the Release target above is reached by `kaal-release` 0.0.1 and the DO Change has been accepted.

The CPO clarified the product boundary (see intent.md): the generic loop serves branch promotion and package release; KAAL consumes it for both and keeps its own decisions.

The CPO's target architecture (9 Nov 23:48) is adopted: Release Management owns the end-to-end process, with Change (implementation), Guard (protection), Testing (verification), Review (validation) and CI/CD as delegated roles (role split of the Owner, 10 Nov). Engineering Release Management remains KAAL's implementation and the vehicle for any CI consolidation; this Change adds none.

The Owner asked for "some basic setup with a skill, potentially mnemonics if we have some for release work already".

## A: the present

No `kaal-release` package exists. General release guidance is mixed into KAAL's own Delivery work (`engineering/release/`, and `engineering/release-management/` landing from its collector). Both stay as they are.

## The gap and the route

1. This PLAN, approved by exact-head CPO review. Lands in the clean `kaal/release/plan` collector (squash).
2. DO: create the package shape from architecture.md, write the Cases RED, then GREEN: T1 to T13.
3. Acceptance on the packed artifact in a clean directory.
3a. CARGO: a separate Change adds `engineering/CARGO.md` (KAAL Definition) with its Cases; the Skill names it only after that is on `main` (T6).
4. Release of `kaal-release` itself is the final step, after release management is on `main`, with its own explicit Owner go.

## Interim and temporary

- The collector is `kaal/release/plan` (collector naming `kaal/<capability>/<leaf>`). It replaced a bare `kaal/release` that git could not hold beside it and that carried a stray first copy of this PLAN; that branch was deleted by the Owner. The interim ended when #1334 was retargeted.
- T5 reads forbidden identities from the Delivery target, which is not on `main` yet. Until it lands, T5 is written against the collector's copy and is marked as interim.
- Auto-merge must be enabled within seconds of a push: today's `Branching` check fails (not holds) while auto-merge is off, and GitHub then refuses to enable it. Release management takes the fix (report "held" instead of fail). This item ends when that fix lands.

## Out of scope

- Releasing `kaal-release`.
- The Release engine (`engineering/release-management/05-src/release-engine/`), owned by Engineering.
- Writing or landing the CARGO Node. It lands through its own Change (see architecture.md); no other new mnemonic is added.

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
2. Decided (Owner, 12 Nov 2026): 0.0.1 is not Skill-only. The release helper lives in kaal-release as a Script inside the Skill, hosted at `skills/kaal-release/scripts/analyze-flow.mjs`. Its Cases and contract are in `plan/coordination/`, added by a later amendment after this PLAN lands.
3. Safe repair of the `kaal/release` collector, preserving unique commits. No reset, promotion or publication is authorized.
