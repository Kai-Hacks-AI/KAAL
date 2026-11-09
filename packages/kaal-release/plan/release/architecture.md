# Release: Architecture (target)

## Placement

Two questions per element, in order (Owner, 9 Nov 2026): is it ours, then is it Delivery or Solution.

| Element | Ours? | Delivery or Solution | Home |
| --- | --- | --- | --- |
| General release-management guidance (the F2 loop) | ours | Solution | `packages/kaal-release/` (this plan) |
| The `Release` Skill Node and the `kaal-release` Agent Skill | ours | Solution | `packages/kaal-release/` |
| npm worked example | ours | Solution | `packages/kaal-release/skills/kaal-release/references/npm.md` |
| SemVer (what it is) | not ours | external standard | cited by name, not restated |
| npm trusted publishing, npm provenance, `npm deprecate` | not ours | ecosystem mechanisms | worked example only, in `references/npm.md` |
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

The Delivery target that holds KAAL's own identities is `engineering/release-management/03-architecture/architecture.md` (landing through its own collector). It is the single source of what counts as KAAL-specific.

## BASS allocation

| Behaviour | Level |
| --- | --- |
| Choosing the version bump, writing release notes | Skill (judgment) |
| Reading the repository's own release decisions | Agent (`AGENTS.md` and Engine Nodes) |
| Checking the Skill's own conformance | Script (the existing `kaal-engineer-skill` checker) |
| Verifying a published artifact | not yet (see 00-changes.md) |

## Mnemonics

Existing ones that bear on release work are reused by reference. None is added.

- **BASS** shapes this package (the table above). On `main`.
- **MOVE** (Main Offers Valuable Experience): a release is what `main` offers onward. On `main`.
- **DISCO** (Deliver Intended Solution Change Outcome): a release delivers the intended Solution as a Change outcome with evidence. Not on `main` yet (PR #1330). The Skill may cite it only after it lands.
- **DRUMS** (Drive Requirements Under Measured Steering): Cases measure, the Owner steers. It fits the approval step. Same condition as DISCO.

## Relationship to release management

`kaal-release` does not depend on `engineering/release-management/` landing: the Skill only points at the folder, and the pointer is checked for being a pointer (T5).
