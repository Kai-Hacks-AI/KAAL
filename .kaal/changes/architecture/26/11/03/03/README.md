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

- **Agent** (`KAAL Agent`): acts within KAAL by applying Capabilities, Skills and Extensions. The package `kaal-agents` is the Capability named Agents (its ownership claim says `capability`), not the Agent concept.
- **Extension** (`KAAL Extension`): enables KAAL to interact with external systems, or they with KAAL. Crossing that boundary is what distinguishes it from a Skill. Per the Owner (3 Nov), an Extension is the adapter to external things. `kaal-slack` sits under `packages/extensions/`.

**Hosting is a Capability (Owner, 3 Nov).** The repository types it otherwise; see the mismatch finding in section 5.

Hosting and Learning are the multi-Skill Capabilities (section 3).

## 2. Method and limits

Read from `origin/main` and every `origin/kaal/*` collector on 3 Nov 2026. Each `SKILL.md` is counted on the
capability's own collector, or on main when it has none. Size is `SKILL.md` lines, a proxy only: it does not
say whether a Skill does more than one job. Scripts are counted two ways: files under the Skill's own
`scripts/`, and package-level `bin/`, `lib/` and `scripts/`. I did not run any test or read every Skill in full.

## 3. Capabilities with several Skills

| Capability (package) | Skills | Note |
| --- | --- | --- |
| Hosting (`kaal-hosting`), a Capability (C) | `kaal-hosting` (64 lines), `kaal-hosting-boundary` (49) | Two Skills, one Capability. The second is the boundary guidance. Discuss: one Skill with a section, or two? |
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
- **Mismatch finding: Hosting's typing.** The Owner says Hosting is a Capability. The repository, on `kaal/hosting`, types it as a `KAAL Extension` (`packages/extensions/kaal-hosting/payload/Hosting.md`, whose Node begins "Hosting enables KAAL to operate within its host environment") and places the package under `packages/extensions/`. The Hosting owner places this as a Defect, confirmed by a RED Test Case, in Hosting's Defect Plan. CTO call: no retyping or move before Hosting 0.0.1 ships, because Hosting is first on the npm critical path and a retype changes a Node id and its dependents' pins. This record changes nothing.
- **A repository's Capability is its instance** (ownership claim in `ownership.kaal.json`). Core's registration already works that way. Nothing in this inventory contradicts it.
- **A possible future builder package (Owner, 3 Nov, for discussion only).** A repository that builds Capabilities or packages starts empty with only Engineering and Packages. Together they could be a package of their own, for builders and not for consumers. This inventory does not authorize it. It touches the open question below on what a consumer sees of `packages/`, and Engineering and Packaging own what would go into it.
- **KAAL-only extras:** `engineering/` holds Engineering's machinery, and `packages/` holds the distributable packages. Hosting, Core and Foundation are packages a consumer receives, so the `packages/` extra is distribution, not capability content. Whether a consumer ever sees `packages/` structure is the packaging discussion, not settled here.

## 6. Questions for the owners and Kai (no action implied)

1. Hosting and Learning, both Capabilities: one Skill or two each? (Owners, then Kai if it changes the model.)
2. A size threshold for "big", or a judgement per Skill? Testing is the first candidate either way.
3. Where should a Skill's scripts live, under the Skill or under the package? The model says Skill. Most packages say package.
4. The Owner's explanations of C to A and C to E are outstanding (an Extension is the adapter to external things, so far). This record is to be revised when they arrive.
5. Packages as a separate, Skill-oriented discussion: when does it open? It would also cover the possible builder package (Engineering plus Packages) above.

Auto-merge is enabled; approval and required checks govern.
