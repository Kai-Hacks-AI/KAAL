# kaal-release 0.0.1: Architecture

## Placement

Two questions per element, in order (Owner, 9 Nov 2026): is it ours, then is it Delivery or Solution.

| Element | Ours? | Delivery or Solution | Home |
| --- | --- | --- | --- |
| General release-management guidance (the F2 loop) | ours | Solution | `packages/kaal-release/` (this plan) |
| The `Release` Skill Node and the `kaal-release` Agent Skill | ours | Solution | `packages/kaal-release/` |
| npm worked example | ours | Solution | `packages/kaal-release/skills/kaal-release/references/npm.md` |
| SemVer, trusted publishing, provenance (what they are) | not ours | external standards | cited by name, not restated |
| KAAL's collectors, two gates, merge queue on `main`, control names | ours | Delivery | `engineering/release-management/`, not shipped |
| The Release engine (`release.mjs`, `run.mjs`) | ours | Delivery | `engineering/release-management/05-src/release-engine/`, not shipped |
| Who approves a KAAL publication, the `npm` environment | Owner's decision | Delivery | the Owner, recorded in repository decisions only |

The shipped package contains Solution elements only. A Delivery element reaches a consumer only as a pointer in the Skill (F5).

## Shape

```
packages/kaal-release/
  package.json  README.md  LICENSE
  payload/Release.md                     (Skill Node, typed KAAL Skill)
  skills/kaal-release/SKILL.md           (the F2 loop; decisions per F3)
  skills/kaal-release/references/npm.md  (F4)
  plan/release/                          (this plan, then the DO's tracing)
  test/                                  (Cases below)
```

The shape follows `kaal-engineer-skill`, the smallest existing Skill package.

## USE vs BUILD

| Need | Decision | Why |
| --- | --- | --- |
| Skill format check | USE `kaal-engineer-skill` checker | It already decides `standard` and `kaal` conformance. |
| Version rules | USE Semantic Versioning 2.0.0 | An industry standard; the Skill cites it. |
| Publishing identity and provenance | USE npm trusted publishing and provenance | The registry's own mechanism; no equivalent to build. |
| Markdown reading in tests | USE `commonmark` | A parser does what a hand-written reader would do. |
| Release engine for consumers | NOT in 0.0.1 | It is KAAL's realization; whether any part generalizes is a later Change with its own USE vs BUILD. |
| Version comparison script | NOT in 0.0.1 | The `semver` package exists; a Script level is added only when a behaviour must repeat exactly. |

## BASS allocation

| Behaviour | Level |
| --- | --- |
| Choosing the version bump, writing release notes | Skill (judgment) |
| Reading the repository's own release decisions | Agent (`AGENTS.md` and Engine Nodes) |
| Checking the Skill's own conformance | Script (the existing `kaal-engineer-skill` checker) |
| Verifying a published artifact | not in 0.0.1 |

## Mnemonics

Existing ones that bear on release work are reused by reference. None is added.

- **BASS** shapes this package (the table above). On `main`.
- **MOVE** (Main Offers Valuable Experience): a release is what `main` offers onward. On `main`.
- **DISCO** (Deliver Intended Solution Change Outcome): a release delivers the intended Solution as a Change outcome with evidence. Not on `main` yet (PR #1330). The Skill may cite it only after it lands.
- **DRUMS** (Drive Requirements Under Measured Steering): Cases measure, the Owner steers. It fits the approval step. Same condition as DISCO.

## Relationship to release management

`engineering/release-management/` defines KAAL's Delivery target and is landing into `main` through its own collector. `kaal-release` does not depend on it landing, since the Skill only points at the folder. The pointer text is checked for being a pointer (F5 Case) so it cannot grow into a copy.
