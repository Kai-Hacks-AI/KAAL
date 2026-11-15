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

## KAAL as consumer

KAAL consumes `kaal-release` for two targets, and its decisions are its own:

| Target | KAAL's realization (Delivery, not shipped) |
| --- | --- |
| Promotion into `main` | `engineering/release-management/` (collectors, gates, merge queue on `main`) |
| Publication to npm | `engineering/release-management/` (version, approval, publishing, verification controls) |

Neither is a template for other consumers. When KAAL adopts the Skill, KAAL's realization is checked against the Skill's loop as a consumer's own decisions would be, and differences are KAAL's recorded decisions, not defects of the Skill.

## Shape

```
packages/kaal-release/
  package.json  README.md  LICENSE
  payload/Release.md                     (Skill Node, typed KAAL Skill)
  skills/kaal-release/SKILL.md           (the F2 loop; decisions per F3)
  skills/kaal-release/references/npm.md  (F4)
  skills/kaal-release/scripts/analyze-flow.mjs  (the hosted Script; contract in coordination/C1)
  plan/release/                          (this plan, then the DO's tracing)
  test/                                  (Cases below)
```

The shape follows `kaal-engineer-skill`, the smallest existing Skill package.

The Delivery target that holds KAAL's own identities is `engineering/release-management/03-architecture/architecture.md` (landing through its own collector). It is the single source of what counts as KAAL-specific.

## Verification and validation

Every capability has a deterministic element (Script) and non-deterministic elements (Bare, Agent, Skill). On top of that, verification is deterministic and validation is not (Owner, 10 Nov 2026): Testing is verification, Review is validation, and quality assurance needs both. Applied here:

| Element | Deterministic (Script) | Non-deterministic (Bare, Agent, Skill) |
| --- | --- | --- |
| kaal-release 0.0.1 | one Script inside the Skill, `skills/kaal-release/scripts/analyze-flow.mjs` (Owner, 12 Nov 2026); KAAL's release engine is a KAAL realization, not part of the product | the Skill: how to design and drive a release process, and the decision whether progression is allowed |
| What Release requires of others | verification evidence (Testing, executed through the consumer's protection runner) | validation of the result (Review) |

0.0.1 ships the Skill as host for its first Script, `analyze-flow.mjs` (Owner decision, 12 Nov 2026). The Script's contract and Cases are described in `plan/coordination/`. Any further deterministic element is a later Change with its own USE vs BUILD (see 00-changes.md).

## BASS allocation

| Behaviour | Level |
| --- | --- |
| Choosing the version bump, writing release notes | Skill (judgment) |
| Reading the repository's own release decisions | Agent (`AGENTS.md` and Engine Nodes) |
| Checking the Skill's own conformance | Script (the existing `kaal-engineer-skill` checker) |
| Listing the next release actions | Script (analyze-flow.mjs, coordination/C1) |
| Verifying a published artifact | not yet (see 00-changes.md) |

## Mnemonics

Existing ones that bear on release work are reused by reference. This PLAN adds none. One new mnemonic, CARGO, was agreed by the Owner during review and is reconciled below.

- **BASS** shapes this package (the table above). On `main`.
- **MOVE** (Main Offers Valuable Experience): a release is what `main` offers onward. On `main`.
- **DISCO** (Deliver Intended Solution Change Outcome): a release delivers the intended Solution as a Change outcome with evidence. Not on `main` yet (PR #1330). The Skill may cite it only after it lands.
- **DRUMS** (Drive Requirements Under Measured Steering): Cases measure, the Owner steers. It fits the approval step. Same condition as DISCO.
- **CARGO** (Change Authorization Releases Guarded Outcomes), agreed by the Owner on #1334. It names the collaboration, not a capability, control or gate. Read under the role split (Release drives, Change implements, Guard protects, Testing verifies, Review judges): the **Change** is authorized and implemented under its record; **Release** drives the authorized change to an outcome; **Guard** protects declared invariants and provides trusted checks and verdicts; and the outcome is **verified** (Testing) and **validated** (Review), not merely published. Release may consume Guard's and Testing's evidence without duplicating their judgments.
  - **Open for the Owner (wording, not mechanism):** "Authorization" in CARGO can be read as the authorized-ness of the change (its record and PLAN/DO integrity, Change's) while the decision to authorize is a validation (Review, or the designated authority). The PLAN keeps the Owner's wording and does not choose between the readings.
  - **Is a new mnemonic.** It is the one addition to the "none added" rule above, made by the Owner, not by this PLAN. It is not on `main` and no Engine Node exists for it.
  - **Where its Node would live:** `engineering/CARGO.md`, a `KAAL Definition` beside BASS, MOVE and the others (Engineering owns the mnemonics root). It lands through its own Change, a separate pull request with its own Cases, like #1330 for DISCO and the others. This PLAN does not add the file.
  - **Where it is used:** in this PLAN and in the Delivery documents that explain the division of roles. In the shipped Skill it may appear only under F6/T6: if, when the Skill is written, CARGO exists as a Node on `main`, and then only by name where the Skill describes the roles of I8. The Skill never defines it, and never uses it as a KAAL-specific gate or control. If CARGO has not landed, the Skill states the same division in plain words and does not name it.
  - **Not KAAL Delivery:** CARGO says nothing about collectors, rulesets, workflows or npm, so it is safe to name in a generic Skill once it has landed.

## Relationship to release management

`kaal-release` does not depend on `engineering/release-management/` landing: the Skill only points at the folder, and the pointer is checked for being a pointer (T5).
