# Architecture: structural model inventory (findings only)

Owner: Architecture. Target: kaal/architecture. Ordinary working Change (documentation only);
record numbering is provisional until integration.

Findings only. Nothing is split, moved, renamed, implemented, synchronized, promoted or published.

## 1. The Owner's model (3 Nov)

KAAL 1..n Capability 1..n Skill 1..n Script.

- When a Skill gets big, it should be split.
- When a Capability has multiple Skills, we discuss it.
- Packages are a separate discussion, but in general Skill oriented.
- In a given repository, the Capability is its instance.
- Engineering and Packages are KAAL-only extras. A KAAL-enabled consumer does not get them.

## 1a. Framed under CASE

CASE is defined in the repository (`packages/kaal-core/payload/core/CASE.md`, a KAAL Definition): it names the four
parallel concepts KAAL is built from, **C**apabilities, **A**gents, **S**kills and **E**xtensions. Each has its own
Definition and none is a kind of another. Core identifies, admits, registers and discovers all four by one mechanism.

Kai has detailed only C versus S so far (Capability 1..n Skill 1..n Script). **The relationships of C to A and of C to E
are open Owner explanations (3 Nov). They are not inferred here.** What follows states only what the Definitions in the
repository say about A and E themselves:

- **Agent** (`KAAL Agent`): acts within KAAL by applying Capabilities, Skills and Extensions. It is not a Skill container. The package `kaal-agents` is the Capability named Agents (its ownership claim says `capability`), not the Agent concept.
- **Extension** (`KAAL Extension`): enables KAAL to interact with external systems, or they with KAAL. Crossing that boundary is what distinguishes it from a Skill. Hosting is typed as an Extension (`payload/Hosting.md`) and sits under `packages/extensions/`. `kaal-slack` does too.

Hosting's `kaal-hosting` and `kaal-hosting-boundary` are two Skills in a package typed as an Extension. How an
Extension relates to Capabilities and to Skills is the open C-to-E explanation, so this record does not say whether
Hosting's two Skills are a multi-Skill case under the Owner's model. It lists them, and Learning's two Skills, as facts.

## 2. Method and limits

Read from `origin/main` and every `origin/kaal/*` collector on 3 Nov 2026. Each `SKILL.md` is counted on the
capability's own collector, or on main when it has none. Size is `SKILL.md` lines, a proxy only: it does not
say whether a Skill does more than one job. Scripts are counted two ways: files under the Skill's own
`scripts/`, and package-level `bin/`, `lib/` and `scripts/`. I did not run any test or read every Skill in full.

## 3. Capabilities with several Skills

| Capability (package) | Skills | Note |
| --- | --- | --- |
| Hosting (`kaal-hosting`), typed as an Extension (E) | `kaal-hosting` (64 lines), `kaal-hosting-boundary` (49) | Two Skills in one package typed as an Extension. The second is the boundary guidance. Treatment waits on the C-to-E explanation |
| Learning (`kaal-learning`), a Capability (C) | `kaal-learning` (39), `kaal-retro` (59) | Two Skills, one Capability. Collector only (`kaal/learning`), not on main. Discuss |

Every other package that has a Skill has exactly one. The other packages on collectors, Slack under Communication
and the duplicate Guard Skill copy under `engineering/guard/external/templates`, are not additional Skills of one Capability.

## 4. Skills that may be big

| Skill | Lines | References | Skill-level scripts | Package-level scripts |
| --- | --- | --- | --- | --- |
| `kaal-testing` | 107 | 3 | 0 | 15 |
| `kaal-controls` | 84 | 0 | 0 | 0 |
| `kaal-core` | 83 | 0 | 0 | 2 |
| `kaal-guard` | 77 | 0 | 0 | 11 |
| `kaal-agents` | 76 | 0 | 0 | 5 |
| `kaal-packaging` | 74 | 0 | 0 | 5 |
| all others | 23 to 69 | | | |

Only `kaal-testing` passes 100 lines. A threshold is a Kai decision: this inventory does not set one. Whether any of these
does several jobs, which is the better reason to split, needs each owner's reading, not a line count.

## 5. Observations against the model

- **Scripts sit mostly at package level, not under a Skill.** Testing has 15 package scripts and no Skill script, Guard 11 and none, Foundation 3 and none.
  Only Graph (8), Review (3), Change (2), Branching (2) and Engineer Skill (2) keep scripts inside a Skill directory. "Capability 1..n Skill 1..n Script" matches the second pattern. The first is what most packages do.
- **Seven Capabilities have no Skill yet:** Process, Requirements, Product, Roles, Service, Data and Project. They are Nodes and Definitions only on their collectors. This is consistent with the model, but their Agent-facing surface does not exist.
- **A repository's Capability is its instance** (ownership claim in `ownership.kaal.json`). Core's registration already works that way. Nothing in this inventory contradicts it.
- **A possible future builder package (Owner, 3 Nov, for discussion only).** A repository that builds Capabilities or packages starts empty with only Engineering and Packages. Together they could be a package of their own, for builders and not for consumers. This inventory does not authorize it. It touches the open question below on what a consumer sees of `packages/`, and Engineering and Packaging own what would go into it.
- **KAAL-only extras:** `engineering/` holds Engineering's machinery, and `packages/` holds the distributable packages. Hosting, Core and Foundation are packages a consumer receives, so the `packages/` extra is distribution, not capability content. Whether a consumer ever sees `packages/` structure is the packaging discussion, not settled here.

## 6. Questions for the owners and Kai (no action implied)

1. Learning (a Capability): one Skill or two? Hosting (typed as an Extension): the same question waits on the Owner's C-to-E explanation, and I do not answer it by analogy.
2. A size threshold for "big", or a judgement per Skill? Testing is the first candidate either way.
3. Where should a Skill's scripts live, under the Skill or under the package? The model says Skill. Most packages say package.
4. The Owner's explanations of C to A and C to E are outstanding. This record is to be revised when they arrive.
5. Packages as a separate, Skill-oriented discussion: when does it open? It would also cover the possible builder package (Engineering plus Packages) above.

Auto-merge is enabled; approval and required checks govern.
